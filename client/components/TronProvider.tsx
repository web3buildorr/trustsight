import { createContext, useContext, useEffect, useState } from "react";

type TronContextType = {
  provider: any;
  address: string;
  setAddress: (address: string) => void;
};

const initContext: TronContextType = {
  provider: null,
  address: "",
  setAddress: () => {},
};

const TronContext = createContext<TronContextType>(initContext);

export const useTron = () => useContext(TronContext);

export const TronProvider = ({ children }: any) => {
  const [address, setAddress] = useState("");
  let provider: any = null;

  // @ts-expect-errorts-ignore
  if (typeof window !== "undefined" && typeof window.tronWeb !== "undefined") {
    provider = window["tronWeb"];
  }

  // hook to handle address changes
  useEffect(() => {
    const fetchedAddress = window.localStorage.getItem("TRON_ADDRESS");
    if (!address && fetchedAddress) setAddress(fetchedAddress);
    if (address && address !== fetchedAddress)
      window.localStorage.setItem("TRON_ADDRESS", address);
  }, [address]);

  return (
    <TronContext.Provider value={{ provider, address, setAddress }}>
      {children}
    </TronContext.Provider>
  );
};
