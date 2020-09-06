import { shell, BrowserWindow, MenuItemConstructorOptions } from 'electron';

/* eslint class-methods-use-this: ["error", { "exceptMethods": ["getHelpMenu"] }] */

export default class MenuTemplateBuilder {
  platform: string;

  isDev: boolean;

  mainWindow: BrowserWindow;

  constructor(mainWindow: BrowserWindow, platform: string, isDev: boolean) {
    this.platform = platform;
    this.isDev = isDev;
    this.mainWindow = mainWindow;
  }

  public getMenuOptions(): MenuItemConstructorOptions[] {
    const file = this.getFileMenu();
    const view = this.getViewMenu();
    const help = this.getHelpMenu();

    return [file, view, help];
  }

  private getFileMenu(): MenuItemConstructorOptions {
    return {
      label: '&File',
      submenu: [
        {
          label: '&Open',
          accelerator: 'Ctrl+O',
        },
        {
          label: '&Close',
          accelerator: 'Ctrl+W',
          click: () => {
            this.mainWindow.close();
          },
        },
      ],
    };
  }

  private getViewMenu(): MenuItemConstructorOptions {
    const prodOptions: MenuItemConstructorOptions[] = [
      {
        label: 'Toggle &Full Screen',
        accelerator: 'F11',
        click: () => {
          this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
        },
      },
      {
        label: '&Theme',
        submenu: [
          {
            label: '&Light',
            click(_, focusedWindow) {
              focusedWindow?.webContents.send('set-theme', ['light']);
            },
          },
          {
            label: '&Dark',
            click(_, focusedWindow) {
              focusedWindow?.webContents.send('set-theme', ['dark']);
            },
          },
        ],
      },
    ];

    const devOptions: MenuItemConstructorOptions[] = [
      {
        label: '&Reload',
        accelerator: 'Ctrl+R',
        click: () => {
          this.mainWindow.webContents.reload();
        },
      },
      {
        label: 'Toggle &Developer Tools',
        accelerator: 'Alt+Ctrl+I',
        click: () => {
          this.mainWindow.webContents.toggleDevTools();
        },
      },
    ];

    return {
      label: '&View',
      submenu: this.isDev ? prodOptions.concat(devOptions) : prodOptions,
    };
  }

  private getHelpMenu(): MenuItemConstructorOptions {
    return {
      label: 'Help',
      submenu: [
        {
          label: 'Learn More',
          click() {
            shell.openExternal(
              'https://github.com/tytremblay/frc-video-splitter-3'
            );
          },
        },
        {
          label: 'Documentation',
          click() {
            shell.openExternal(
              'https://github.com/tytremblay/frc-video-splitter-3/blob/master/README.md'
            );
          },
        },
        {
          label: 'Submit Issues',
          click() {
            shell.openExternal(
              'https://github.com/tytremblay/frc-video-splitter-3/issues'
            );
          },
        },
      ],
    };
  }
}
