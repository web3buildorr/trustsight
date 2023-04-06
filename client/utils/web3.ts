export async function handleConnect(setLoading, setAddress, provider) {
  setLoading(true);
  try {
    await provider.request({
      method: "tron_requestAccounts",
    });
    if (provider && provider.defaultAddress) {
      setTimeout(() => {
        setAddress(provider.defaultAddress.base58);
        setLoading(false);
      }, 500);
    }
  } catch (error) {
    console.log(error);
  }
}

export async function handleDisconnect(
  setIsLoading,
  setAddress,
  handleNavigate
) {
  setIsLoading(true);
  try {
    setTimeout(() => {
      setAddress("");
      window.localStorage.removeItem("TRON_ADDRESS");
      handleNavigate();
      setIsLoading(false);
    }, 500);
  } catch (error) {
    console.error(error);
  }
}
