pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/mimcsponge.circom";

template HashThreeThings() {
    signal input one;
    signal input two;
    signal input three;
    signal output hash;

    component hasher = MiMCSponge(3, 220, 1);
    hasher.ins[0] <== one;
    hasher.ins[1] <== two;
    hasher.ins[2] <== three;
    hasher.k <== 0;
    hash <== hasher.outs[0];
}

template Attestation() {
    signal input secret;
    signal input buyer;
    signal input trackingNumber;

    signal output attestation;

    component hash = HashThreeThings();
    hash.one <== secret;
    hash.two <== buyer;
    hash.three <== trackingNumber;

    attestation <== hash.hash;
}

component main {public [buyer]} = Attestation();
