function transferToTenThousandth(amount: bigint): bigint {
  return BigInt(Number(amount) * Number(100));
}

function transferFromTenThousandth(amount: bigint) {
  return Number(amount) / Number(100);
}

export { transferToTenThousandth, transferFromTenThousandth };
