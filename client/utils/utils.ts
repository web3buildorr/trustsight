import { ethers } from "ethers";
import TronWeb from "tronweb";

export const TRUSTSIGHT_API_URL =
  process.env.NEXT_PUBLIC_ENV === "prod"
    ? process.env.NEXT_PUBLIC_API_PROD
    : process.env.NEXT_PUBLIC_API_DEV;

export function abridgeAddress(address?: string) {
  if (!address) return address;
  const l = address.length;
  if (l < 20) return address;
  return `${address.substring(0, 6)}...${address.substring(l - 4, l)}`;
}

export function abridgeCharacters(address?: string, char?: number) {
  if (!address) return address;
  const l = address.length;
  if (l <= char) return address;
  return `${address.substring(0, char)}...`;
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

export function encodeStringAsBytes32(text): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(text);
  const paddedBytes = new Uint8Array(32).fill(0);

  if (bytes.length > 32) {
    console.log(text);
    throw new Error("Text must be 32 bytes or shorter.");
  }

  paddedBytes.set(bytes);

  return "0x" + Buffer.from(paddedBytes).toString("hex");
}

export function encodeStringAsBytes(text: string): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(text);
  return "0x" + Buffer.from(bytes).toString("hex");
}

export function decodeBytesAsString(bytesHex: string): string {
  let hexString = bytesHex.substring(2); // remove the "0x" prefix
  let bytes = Buffer.from(hexString, "hex");
  let decoder = new TextDecoder();
  return decoder.decode(bytes);
}
