export function toastSearchFailed(toast: any, message: string) {
  toast({
    title: "Search failed.",
    description: message,
    status: "error",
    duration: 4000,
    isClosable: true,
  });
}

export function toastConnectWallet(toast: any, message: string) {
  toast({
    title: "Wallet not connected.",
    description: message,
    status: "error",
    duration: 4000,
    isClosable: true,
  });
}
