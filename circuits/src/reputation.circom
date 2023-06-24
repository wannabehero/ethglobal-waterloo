pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/comparators.circom";

template Reputation() {
   signal input reputation;
   signal input target;

   component gte = GreaterEqThan(252);
   gte.in[0] <== reputation;
   gte.in[1] <== target;
   gte.out === 1;
}

component main {public [target]} = Reputation();
