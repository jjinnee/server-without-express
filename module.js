import http from "http";
import url from "url";
import querystring from "querystring";

export default class App {
  constructor() {
    this.routes = {
      GET: {},
      POST: {},
      PUT: {},
      DELETE: {},
    };
    this.middlewares = [];
  }

  /**
   *
   * @param {(req: http.IncomingMessage, res: http.ServerResponse, next: Function)} handler
   */
  use(handler) {
    this.middlewares.push(handler);
  }

  /**
   *
   * @param {string} path
   * @param {(req: http.IncomingMessage, res:http.ServerResponse)} handler
   */
  get(path, handler) {
    this.routes["GET"][path] = handler;
  }

  /**
   *
   * @param {string} path
   * @param {(req: http.IncomingMessage, res:http.ServerResponse)} handler
   */
  post(path, handler) {
    this.routes["POST"][path] = handler;
  }

  /**
   *
   * @param {string} path
   * @param {(req: http.IncomingMessage, res:http.ServerResponse)} handler
   */
  put(path, handler) {
    this.routes["PUT"][path] = handler;
  }

  /**
   *
   * @param {string} path
   * @param {(req: http.IncomingMessage, res:http.ServerResponse)} handler
   */
  delete(path, handler) {
    this.routes["DELETE"][path] = handler;
  }

  /**
   *
   * @param {http.IncomingMessage} req
   * @param {http.ServerResponse} res
   */
  handle(req, res) {
    const method = req.method;
    const parsedUrl = url.parse(req.url);
    const path = parsedUrl.pathname;
    const query = querystring.parse(parsedUrl.query);

    let idx = 0;

    const next = () => {
      idx++;
      if (this.middlewares[idx]) {
        this.middlewares[idx](req, res, next);
      }
    };

    const handler = this.routes[method][path];
    if (handler) {
      if (this.middlewares[0]) {
        this.middlewares[0](req, res, next);
      }
      handler(req, res, query);
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 Not Found");
    }
  }

  /**
   *
   * @param {number} port
   * @param {() => void} callback
   */
  listen(port, callback) {
    const server = http.createServer((req, res) => {
      this.handle(req, res);
    });

    server.listen(port, callback);
  }
}
