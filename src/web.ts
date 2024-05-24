import { CapacitorHttp, WebPlugin } from '@capacitor/core';

export class SynologyDocsWeb extends WebPlugin {
  private url?: string;
  private sid?: string;
  private synoToken?: string;

  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('ECHO', options);
    return options;
  }

  constructor() {
    super();
    const sid = localStorage.getItem('_sid');
    if (sid) {
      this.sid = sid;
    }
    const synoToken = localStorage.getItem('_synoToken');
    if (synoToken) {
      this.synoToken = synoToken;
    }
  }

  public configure(url: string): void {
    this.url = url;
  }

  async auth(
    username: string,
    password: string,
    otp_code?: string,
  ): Promise<boolean> {
    const params = {
      api: 'SYNO.API.Auth',
      version: '6',
      method: 'login',
      account: username,
      passwd: password,
      session: 'FileStation',
      enable_syno_token: 'yes',
      format: 'sid',
    } as any;
    if (otp_code) {
      params['otp_code'] = otp_code;
    }
    return this.get(`${this.url}/webapi/auth.cgi`, params).then(res => {
      const synoToken = res.data?.data?.synotoken;
      if (synoToken) {
        this.synoToken = synoToken;
        localStorage.setItem('_synoToken', synoToken);
      }
      const sid = res.data?.data?.sid;
      if (sid) {
        this.sid = sid;
        localStorage.setItem('_sid', sid);
        return !!(this.sid && this.sid.length > 0);
      }
      return false;
    });
  }

  async list(path: string): Promise<{
    folders: {
      isdir: boolean;
      name: string;
      path: string;
    }[];
  }> {
    return this.get(`${this.url}/webapi/entry.cgi`, {
      api: 'SYNO.FileStation.List',
      version: '2',
      method: 'list',
      folder_path: path,
      additional: ['real_path', 'size', 'time', 'type'],
    }).then(res => res.data.data?.files);
  }

  async rename(
    path: string,
    newName: string,
  ): Promise<{
    isdir: boolean;
    name: string;
    path: string;
  }> {
    return this.get(`${this.url}/webapi/entry.cgi`, {
      api: 'SYNO.FileStation.Rename',
      version: '2',
      method: 'rename',
      path,
      name: newName,
    }).then(res => res.data.data?.files[0]);
  }

  async delete(path: string): Promise<boolean> {
    return this.get(`${this.url}/webapi/entry.cgi`, {
      api: 'SYNO.FileStation.Delete',
      version: '2',
      method: 'delete',
      recursive: 'true',
      path,
    }).then(res => res.data.success);
  }

  async createFolder(
    path: string,
    name: string,
    force_parent = false,
  ): Promise<{
    isdir: boolean;
    name: string;
    path: string;
  }> {
    return this.get(`${this.url}/webapi/entry.cgi`, {
      api: 'SYNO.FileStation.CreateFolder',
      version: '2',
      method: 'create',
      folder_path: path,
      name,
      force_parent: force_parent ? 'true' : 'false',
    }).then(res => res.data.folders[0]);
  }

  async getinfo(path: string): Promise<{
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
  }> {
    return this.get(`${this.url}/webapi/entry.cgi`, {
      api: 'SYNO.FileStation.List',
      version: '2',
      method: 'getinfo',
      path,
      additional: ['real_path', 'size', 'owner', 'time', 'perm', 'type'],
    }).then(res => res.data.data?.files[0]);
  }

  async download(path: string): Promise<unknown> {
    return this.get(`${this.url}/webapi/entry.cgi`, {
      api: 'SYNO.FileStation.Download',
      version: '2',
      method: 'download',
      path,
      mode: 'download',
    }).then(res => res.data);
  }

  async upload(
    path: string,
    fileName: string,
    content: string,
    type = 'text/plain',
  ): Promise<unknown> {
    const url = `${this.url}/webapi/entry.cgi`;

    let params = {
      api: 'SYNO.FileStation.Upload',
      method: 'upload',
      version: '2',
    } as any;

    if (this.sid && this.sid.length > 0) {
      params = { ...params, ...{ _sid: this.sid } };
    }

    if (this.synoToken && this.synoToken.length > 0) {
      params = { ...params, ...{ SynoToken: this.synoToken } };
    }

    const file = new File([content], fileName, { type });

    const data = new FormData();
    data.set('path', path);
    data.set('file', file);

    const options = { url, params, data };

    return await CapacitorHttp.post(options);
  }

  private async get(
    url: string,
    params?: { [key: string]: string | string[] },
  ) {
    const options = { url, params };
    if (this.sid && this.sid.length > 0) {
      options.params = { _sid: this.sid, ...options.params };
    }
    if (this.synoToken && this.synoToken.length > 0) {
      options.params = { SynoToken: this.synoToken, ...options.params };
    }
    return await CapacitorHttp.get(options);
  }
}
