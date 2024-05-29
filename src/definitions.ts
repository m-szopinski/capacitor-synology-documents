export interface SynologyDocsPlugin {
  echo(options: { value: string }): Promise<{ value: string }>;
  configure(url: string): void;
  auth(username: string, password: string, otp_code?: string): Promise<boolean>;
  readdir(path: string): Promise<
    {
      isdir: boolean;
      name: string;
      path: string;
    }[]
  >;
  rename(
    path: string,
    newName: string,
  ): Promise<{
    isdir: boolean;
    name: string;
    path: string;
  }>;
  delete(path: string): Promise<boolean>;
  fileExist(path: string): Promise<boolean>;
  mkdir(
    path: string,
    name: string,
    force_parent?: boolean,
  ): Promise<{
    isdir: boolean;
    name: string;
    path: string;
  }>;
  stat(path: string): Promise<{
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
  }>;
  readFile(path: string): Promise<unknown>;
  writeFile(
    path: string,
    fileName: string,
    content: string,
    type?: string,
  ): Promise<unknown>;
}
