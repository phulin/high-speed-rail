import {
  ChakraProvider,
  createSystem,
  defaultBaseConfig,
} from "@chakra-ui/react";
import Layout from "./Layout";
import { FC } from "react";
import { RefreshContextProvider } from "tome-kolmafia-react";

const system = createSystem(defaultBaseConfig);

const App: FC = () => (
  <ChakraProvider value={system}>
    <RefreshContextProvider characterStateOverride={() => Promise.resolve({})}>
      <Layout />
    </RefreshContextProvider>
  </ChakraProvider>
);

export default App;
