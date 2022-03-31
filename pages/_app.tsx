import "@fontsource/rubik";
import "@fontsource/rubik/600.css";
import "@fontsource/roboto-mono";
import "@fontsource/roboto-mono/500.css";
import "@blueprintjs/popover2/lib/css/blueprint-popover2.css";
import "styles/globals.css";

import { Web3ReactProvider } from "@web3-react/core";
import { AppProps } from "next/app";
import React, { ReactElement } from "react";
import { QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { getEthereumProviderLibrary } from "src/elf/getEthereumProviderLibrary";
import { queryClient } from "src/elf/queryClient";
import { addressesJson } from "src/elf-council-addresses";
import { Notifications } from "src/ui/notifications/Notifications";
import { ElementLogo } from "src/ui/base/svg/ElementLogo/ElementLogo";
import ElementIconCircleStories from "src/ui/base/ElementIconCircle/ElementIconCircle.stories";
import ElementIcon, { IconSize } from "src/ui/base/svg/ElementIcon/ElementIcon";

// We want to log out addresses for sanity/debugging purposes
// eslint-disable-next-line no-console
console.log(addressesJson);
function MyApp({ Component, pageProps }: AppProps): ReactElement {
  return (
    <div className="h-screen bg-hackerSky">
      <ElementIcon className="m-auto mt-48" size={IconSize.MASSIVE} />
      <div className="m-auto mt-4 text-center font-sans text-2xl font-semibold text-slate-900">
        Coming soon...
      </div>
    </div>
  );
}

export default MyApp;
