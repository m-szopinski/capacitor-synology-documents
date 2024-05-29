import { CapacitorHttp, WebPlugin } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

export class SynologyDocsWeb extends WebPlugin {
  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('ECHO', options);
    return options;
  }

  constructor() {
    super();
  }

  public configure(url: string): void {
    localStorage.setItem('_syno_url', url);
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
    return this.get(`/webapi/auth.cgi`, params).then(async res => {
      const synoToken = res.data?.data?.synotoken;
      if (synoToken) {
        await Preferences.set({ key: '_syno_token', value: synoToken });
      }
      const sid = res.data?.data?.sid;
      if (sid) {
        await Preferences.set({ key: '_syno_sid', value: sid });
        return !!(sid && sid.length > 0);
      }
      return false;
    });
  }

  async readdir(path: string): Promise<
    {
      isdir: boolean;
      name: string;
      path: string;
    }[]
  > {
    return this.get('/webapi/entry.cgi', {
      api: 'SYNO.FileStation.List',
      version: '2',
      method: 'list',
      folder_path: path,
      additional: ['real_path', 'size', 'time', 'type'],
    }).then(res => res.data.data?.files);
  }

  async fileExist(path: string): Promise<boolean> {
    return this.get('/webapi/entry.cgi', {
      api: 'SYNO.FileStation.List',
      version: '2',
      method: 'list',
      folder_path: path,
      additional: ['real_path', 'size', 'time', 'type'],
    }).then(res => !!res.data.data?.files[0]);
  }

  async rename(
    path: string,
    newName: string,
  ): Promise<{
    isdir: boolean;
    name: string;
    path: string;
  }> {
    return this.get('/webapi/entry.cgi', {
      api: 'SYNO.FileStation.Rename',
      version: '2',
      method: 'rename',
      path,
      name: newName,
    }).then(res => res.data.data?.files[0]);
  }

  async delete(path: string): Promise<boolean> {
    return this.get('/webapi/entry.cgi', {
      api: 'SYNO.FileStation.Delete',
      version: '2',
      method: 'delete',
      recursive: 'true',
      path,
    }).then(res => res.data.success);
  }

  async mkdir(
    path: string,
    name: string,
    force_parent = false,
  ): Promise<{
    isdir: boolean;
    name: string;
    path: string;
  }> {
    return this.get('/webapi/entry.cgi', {
      api: 'SYNO.FileStation.CreateFolder',
      version: '2',
      method: 'create',
      folder_path: path,
      name,
      force_parent: force_parent ? 'true' : 'false',
    }).then(res => res.data.folders[0]);
  }

  async stat(path: string): Promise<{
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
  }> {
    return this.get('/webapi/entry.cgi', {
      api: 'SYNO.FileStation.List',
      version: '2',
      method: 'getinfo',
      path,
      additional: ['real_path', 'size', 'owner', 'time', 'perm', 'type'],
    }).then(res => res.data.data?.files[0]);
  }

  async readFile(path: string): Promise<unknown> {
    return this.get('/webapi/entry.cgi', {
      api: 'SYNO.FileStation.Download',
      version: '2',
      method: 'download',
      path,
      mode: 'download',
    }).then(res => res.data);
  }

  async writeFile(
    path: string,
    fileName: string,
    content: string,
    type = 'text/plain',
  ): Promise<unknown> {

    let params = {
      api: 'SYNO.FileStation.Upload',
      method: 'upload',
      version: '2',
    } as any;

    const baseUrl = await Preferences.get({ key: '_syno_url' }).then((res) => res.value);
    const url = `${baseUrl}/webapi/entry.cgi`;
    const sid = await Preferences.get({ key: '_syno_sid' }).then((res) => res.value);
    const synoToken = await Preferences.get({ key: '_syno_token' }).then((res) => res.value);

    if (sid && sid.length > 0) {
      params = { ...params, ...{ _sid: sid } };
    }

    if (synoToken && synoToken.length > 0) {
      params = { ...params, ...{ SynoToken: synoToken } };
    }

    const file = new File([content], fileName, { type });

    const data = new FormData();
    data.set('path', path);
    data.set('file', file);

    const options = { url, params, data };

    return await CapacitorHttp.post(options);
  }

  private async get(
    address: string,
    params?: { [key: string]: string | string[] },
  ) {
    const baseUrl = await Preferences.get({ key: '_syno_url' }).then((res) => res.value);
    const url = `${baseUrl}${address}`;
    const sid = await Preferences.get({ key: '_syno_sid' }).then((res) => res.value);
    const synoToken = await Preferences.get({ key: '_syno_token' }).then((res) => res.value);
    const options = { url, params };
    if (sid && sid.length > 0) {
      options.params = { _sid: sid, ...options.params };
    }
    if (synoToken && synoToken.length > 0) {
      options.params = { SynoToken: synoToken, ...options.params };
    }
    return await CapacitorHttp.get(options);
  }
}
