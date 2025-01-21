"use client";

import { ChakraProvider, createSystem, defaultConfig } from "@chakra-ui/react";
import { ThemeProvider } from "next-themes";
import React from "react";

const system = createSystem(defaultConfig);

interface ProviderProps {
  children: React.ReactNode;
}

const CustomProvider: React.FC<ProviderProps> = ({ children }) => {
  return (
    <ChakraProvider value={system}>
      <ThemeProvider attribute="class" disableTransitionOnChange>
        {children}
      </ThemeProvider>
    </ChakraProvider>
  );
};

export default CustomProvider;
