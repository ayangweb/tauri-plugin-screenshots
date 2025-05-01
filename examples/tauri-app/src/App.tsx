import { useBoolean, useMount, useReactive } from "ahooks";
import {
  getScreenshotableWindows,
  getScreenshotableMonitors,
  ScreenshotableWindow,
  ScreenshotableMonitor,
  getWindowScreenshot,
  getMonitorScreenshot,
} from "tauri-plugin-screenshots-api";
import { Button, Divider, List, Image, Spin, message } from "antd";
import { convertFileSrc } from "@tauri-apps/api/core";
import { getName } from "@tauri-apps/api/app";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";

interface State {
  appName: string;
  windowTitle: string;
  currentWindow?: ScreenshotableWindow;
  screenshotableWindows: ScreenshotableWindow[];
  screenshotableMonitors: ScreenshotableMonitor[];
  windowScreenshots: Record<number, string>;
  monitorScreenshots: Record<number, string>;
}

const App = () => {
  const state = useReactive<State>({
    appName: "",
    windowTitle: "",
    screenshotableWindows: [],
    screenshotableMonitors: [],
    windowScreenshots: {},
    monitorScreenshots: {},
  });

  const [loading, { toggle }] = useBoolean();

  useMount(async () => {
    const appWindow = getCurrentWebviewWindow();

    state.appName = await getName();
    state.windowTitle = await appWindow.title();

    const screenshotableWindows = await getScreenshotableWindows();

    for (const window of screenshotableWindows) {
      const { appName, title } = window;

      if (appName === state.appName && title === state.windowTitle) {
        state.currentWindow = window;
      } else {
        state.screenshotableWindows.push(window);
      }
    }

    state.screenshotableMonitors = await getScreenshotableMonitors();
  });

  return (
    <>
      <Spin fullscreen spinning={loading} />

      <Divider orientation="left">Current Window</Divider>

      <List
        bordered
        dataSource={state.currentWindow ? [state.currentWindow] : []}
        renderItem={(item) => {
          const { id, name } = item;

          return (
            <List.Item
              key={id}
              actions={[
                <Button
                  onClick={async () => {
                    try {
                      toggle();

                      const url = await getWindowScreenshot(id);

                      state.windowScreenshots[id] = convertFileSrc(url);
                    } catch (error) {
                      message.error(String(error));
                    } finally {
                      toggle();
                    }
                  }}
                >
                  Screenshot
                </Button>,
                <Image
                  width={50}
                  height={50}
                  src={state.windowScreenshots[id]}
                />,
              ]}
            >
              {name}
            </List.Item>
          );
        }}
      />

      <Divider orientation="left">Screenshotable Windows</Divider>

      <List
        bordered
        dataSource={state.screenshotableWindows}
        renderItem={(item) => {
          const { id, name } = item;

          return (
            <List.Item
              key={id}
              actions={[
                <Button
                  onClick={async () => {
                    try {
                      toggle();

                      const url = await getWindowScreenshot(id);

                      state.windowScreenshots[id] = convertFileSrc(url);
                    } catch (error) {
                      message.error(String(error));
                    } finally {
                      toggle();
                    }
                  }}
                >
                  Screenshot
                </Button>,
                <Image
                  width={50}
                  height={50}
                  src={state.windowScreenshots[id]}
                />,
              ]}
            >
              {name}
            </List.Item>
          );
        }}
      />

      <Divider orientation="left">Screenshotable Monitors</Divider>

      <List
        bordered
        dataSource={state.screenshotableMonitors}
        renderItem={(item) => {
          const { id, name } = item;

          return (
            <List.Item
              key={id}
              actions={[
                <Button
                  onClick={async () => {
                    try {
                      toggle();

                      const url = await getMonitorScreenshot(id);

                      state.monitorScreenshots[id] = convertFileSrc(url);
                    } catch (error) {
                      message.error(String(error));
                    } finally {
                      toggle();
                    }
                  }}
                >
                  Screenshot
                </Button>,
                <Image
                  width={50}
                  height={50}
                  src={state.monitorScreenshots[id]}
                />,
              ]}
            >
              {name}
            </List.Item>
          );
        }}
      />
    </>
  );
};

export default App;
