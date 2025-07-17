const data = require("./data")();

class OpenAiStream {
  #readStream;
  #chunks;

  constructor(readStream) {
    this.#readStream = readStream;
    this.#chunks = [];
  }

  async consume({ onEnd, onError }) {
    const reader = this.#readStream.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        console.log(done, value);
        if (done) {
          await onEnd(this.#chunks);
          break;
        }
        this.#chunks.push(value);
      }
    } catch (error) {
      await onError(error);
    } finally {
      reader.releaseLock();
    }
  }
}

module.exports = class OpenAi {
  static #MAX_STREAMS = 1;

  static #pending = [];
  static #streaming = [];
  static #streams = {};

  static async #openAiTokenStream({ connection, modelId, soFarMessages }) {
    const connectionHost = connection.host.replaceAll("/v1", "");
    const url = `${connectionHost}/v1/chat/completions`;
    console.log(`Fetching OpenAI stream from ${url} with model ${modelId}`);

    const headers = {
      "Content-Type": "application/json",
      ...(connection.key ? { Authorization: `Bearer ${connection.key}` } : {}),
    };
    const body = JSON.stringify({
      model: modelId,
      messages: soFarMessages.map((m) => ({
        role: m.openAiRole,
        content: m.content,
      })),
      stream: true,
    });
    const response = await fetch(url, {
      method: "POST",
      headers,
      body,
    });
    if (!response.ok) {
      throw new Error(
        `Failed to fetch OpenAI stream: ${response.status} ${response.statusText
        } ${await response.text()}`
      );
    }
    const tokenReader = response.body
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(
        new TransformStream({
          start() {
            this.buffer = "";
          },
          transform(chunk, controller) {
            try {
              this.buffer += chunk;
              const lines = this.buffer.split("\n");
              this.buffer = lines.pop() || "";
              for (const line of lines) {
                const trimmedLine = line.trim();
                if (!trimmedLine) continue;
                if (trimmedLine.startsWith("data: ")) {
                  const dataContent = trimmedLine.slice(6);
                  if (dataContent === "[DONE]") {
                    return;
                  }
                  const data = JSON.parse(dataContent);
                  if (data.choices && data.choices.length > 0) {
                    const delta = data.choices[0].delta;
                    if (delta && delta.content) {
                      controller.enqueue(delta.content);
                    }
                  }
                }
              }
            } catch (error) {
              controller.error(error);
            }
          },
          flush(controller) {
            if (this.buffer.trim()) {
              const trimmedLine = this.buffer.trim();
              if (trimmedLine.startsWith("data: ")) {
                const dataContent = trimmedLine.slice(6);
                if (dataContent !== "[DONE]") {
                  const data = JSON.parse(dataContent);
                  if (data.choices && data.choices.length > 0) {
                    const delta = data.choices[0].delta;
                    if (delta && delta.content) {
                      controller.enqueue(delta.content);
                    }
                  }
                }
              }
            }
          },
        })
      );

    return tokenReader;
  }

  static async #process(message) {
    try {
      OpenAi.#streaming.push(message);
      const allMessages = await data.message.findMessagesByChatId(
        message.chatId
      );
      let soFarMessages = [];
      for (const m of allMessages) {
        if (m.id === message.id) {
          soFarMessages.push(m);
          break;
        }
        soFarMessages.push(m);
      }
      const connection = await data.connections.findConnection(
        message.connectionId
      );
      let stream = (OpenAi.#streams[message.id] = new OpenAiStream(
        await OpenAi.#openAiTokenStream({
          connection,
          modelId: message.modelId,
          soFarMessages,
        })
      ));
      let content;
      await stream.consume({
        onEnd: async (chunks) => {
          content = chunks.join("");
        },
        onError: async (error) => {
          throw new Error(`Stream error: ${error.message}`);
        },
      });
      await data.message.updateMessage(message.id, {
        openAiStreamStatus: "finished",
        openAiFinishedStreamingAt: new Date().toISOString(),
      });
      await data.message.addMessage({
        chatId: message.chatId,
        openAiRole: "assistant",
        openAiStartedStreamingAt: message.openAiStartedStreamingAt,
        openAiFinishedStreamingAt: new Date().toISOString(),
        openAiStreamStatus: "finished",
        connectionId: message.connectionId,
        modelId: message.modelId,
        content,
        createdAt: new Date().toISOString(),
      });
    } catch (e) {
      await data.message.updateMessage(message.id, {
        openAiStreamStatus: "error",
        openAiStreamError: e.message ?? "Unknown error",
      });
    } finally {
      OpenAi.#tick();
    }
  }

  static #tick() {
    for (const message of OpenAi.#pending) {
      if (OpenAi.#streaming.length < OpenAi.#MAX_STREAMS) {
        OpenAi.#process(message);
      } else {
        break;
      }
    }
  }

  static dispatchMessage(message) {
    OpenAi.#pending.push(message);
    OpenAi.#tick();
  }

  static getReadStream(id) {
    throw new Error("Not implemented");
  }
};
