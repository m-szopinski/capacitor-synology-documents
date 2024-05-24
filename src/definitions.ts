export interface SynologyDocsPlugin {
  echo(options: { value: string }): Promise<{ value: string }>;
  configure(url: string): void;
  auth(username: string, password: string, otp_code?: string): Promise<boolean>;
  list(path: string): Promise<{
    folders: {
      isdir: boolean;
      name: string;
      path: string;
    }[];
  }>;
  rename(
    path: string,
    newName: string,
  ): Promise<{
    isdir: boolean;
    name: string;
    path: string;
  }>;
  delete(path: string): Promise<boolean>;
  createFolder(
    path: string,
    name: string,
    force_parent?: boolean,
  ): Promise<{
    isdir: boolean;
    name: string;
    path: string;
  }>;
  getinfo(path: string): Promise<{
    files: {
      isdir: boolean;
      name: string;
      path: string;
      additional: {
        size: number;
        type: string;
        time: unknown;
        real_path: string;
        perm: unknown;
        owner: { user: string };
      };
    }[];
  }>;
  download(path: string): Promise<unknown>;
  upload(
    path: string,
    fileName: string,
    content: string,
    type?: string,
  ): Promise<unknown>;
}
