import {
  Address,
  BigInt,
  ByteArray,
  Bytes,
  crypto,
  EthereumEvent,
  store,
  Value,
} from '@graphprotocol/graph-ts';

export function concat(a: ByteArray, b: ByteArray): ByteArray {
  let out = new Uint8Array(a.length + b.length);
  for (let i = 0; i < a.length; i++) {
    out[i] = a[i];
  }
  for (let j = 0; j < b.length; j++) {
    out[a.length + j] = b[j];
  }
  return out as ByteArray;
}

export function eventId(event: EthereumEvent): string {
  return crypto
    .keccak256(
      concat(event.transaction.hash, Bytes.fromI32(event.transactionLogIndex.toI32())),
    )
    .toHex();
}

export function hexToAddress(hex: string): Address {
  return Address.fromString(hex.substr(2));
}

export function equals(a: BigInt, b: BigInt): boolean {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}

export function equalsBytes(a: Bytes, b: Bytes): boolean {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}

export function equalStrings(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i].charCodeAt(0) !== b[i].charCodeAt(0)) {
      return false;
    }
  }
  return true;
}
