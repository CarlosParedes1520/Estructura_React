// core/errors/HttpException.ts
export default class HttpException extends Error {
  code?: number;
  data?: unknown;

  constructor(opts: { code?: number; message?: string; data?: unknown } = {}) {
    super(opts.message ?? "Error de servidor");
    this.name = "HttpException";
    this.code = opts.code;
    this.data = opts.data;

    // Fija el prototipo para que instanceof funcione tras transpilar
    Object.setPrototypeOf(this, new.target.prototype);
    // Stack limpia en Node
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HttpException);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      data: this.data,
    };
  }

  // Útil si quieres crear la excepción desde un catch de Axios
  static fromAxios(err: unknown): HttpException {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const e = err as any;
    const status = e?.response?.status as number | undefined;
    const payload = e?.response?.data;
    const msg =
      (payload && (payload.message || payload.error || payload.msg)) ||
      e?.message ||
      "Error de red";
    return new HttpException({ code: status, message: msg, data: payload });
  }
}
