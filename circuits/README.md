# Preparation

## Ceremony
```sh
cd ceremony
npx snarkjs powersoftau new bn128 14 pot14_0000.ptau -v
npx snarkjs powersoftau contribute pot14_0000.ptau pot14_0001.ptau --name="zbay" -v
npx snarkjs powersoftau beacon pot14_0001.ptau pot14_beacon.ptau RANDOM_HEX_NUMBER_OF_62_LEN 10 -n="Final"
npx snarkjs powersoftau prepare phase2 pot14_beacon.ptau pot14_final.ptau -v
```

## Circuits
```sh
cd snarks
circom ../src/attestation.circom --r1cs --wasm --sym
circom ../src/reputation.circom --r1cs --wasm --sym

# export r1cs
npx snarkjs r1cs export json attestation.r1cs attestation.r1cs.json
npx snarkjs r1cs export json reputation.r1cs reputation.r1cs.json

# setup plonk
npx snarkjs plonk setup attestation.r1cs ../ceremony/pot14_final.ptau attestation_plonk.zkey
npx snarkjs plonk setup reputation.r1cs ../ceremony/pot14_final.ptau reputation_plonk.zkey

# export the verification key
npx snarkjs zkey export verificationkey attestation_plonk.zkey attestation_key.json
npx snarkjs zkey export verificationkey reputation_plonk.zkey reputation_key.json

# export the verifier
npx snarkjs zkey export solidityverifier attestation_plonk.zkey ../../chain/contracts/verifiers/zk/AttestationVerifier.sol
npx snarkjs zkey export solidityverifier reputation_plonk.zkey ../../chain/contracts/verifiers/zk/ReputationVerifier.sol
```
