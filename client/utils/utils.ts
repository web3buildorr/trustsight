export function abridgeAddress(address?: string, chars = 6) {
  if (!address) return address;
  const l = address.length;
  return `${address.substring(0, chars)}...${address.substring(l - chars, l)}`;
}

export function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function isBase58String(value: string): boolean {
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;
  return base58Regex.test(value);
}

export function isValidTronAddress(address: string): boolean {
  const addressLength = 34;
  const tronAddressPrefix = /^T/;

  if (!tronAddressPrefix.test(address)) {
    return false;
  }

  if (address.length !== addressLength) {
    return false;
  }

  const addressWithoutPrefix = address.slice(1);

  if (!isBase58String(addressWithoutPrefix)) {
    return false;
  }

  return true;
}
