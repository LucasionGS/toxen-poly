import { ISettings } from "@shared/ISettings";

export default class Settings {
  private data: ISettings;
  public getRawData() {
    return this.data;
  }

  constructor(data: ISettings) {
    this.data = data;
  }

  public get<T extends keyof ISettings>(key: T): ISettings[T] {
    return this.data[key];
  }

  public set<T extends keyof ISettings>(key: T, value: ISettings[T]): void {
    this.data[key] = value;
  }

  public apply(data: Partial<ISettings>): void {
    Object.assign(this.data, data);
  }

  public getMultiple<const T extends keyof ISettings>(...keys: T[]): Pick<ISettings, T> {
    const result = {} as Pick<ISettings, T>;
    for (const key of keys) {
      result[key] = this.data[key];
    }
    return result;
  }
}