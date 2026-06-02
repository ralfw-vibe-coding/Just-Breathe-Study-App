import type { AppConfig } from "../../../shared/types";
import { getAppConfig } from "../domain/providers/appConfig";

export class GetAppConfigReactor {
  async process(): Promise<AppConfig> {
    return getAppConfig();
  }
}
