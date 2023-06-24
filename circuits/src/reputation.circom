pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/comparators.circom";

template Reputation() {
   signal input feedbackSource;
   signal input itemsSource;
   signal input feedbackTarget;
   signal input itemsTarget;

   component gteFeedback = GreaterEqThan(252);
   gteFeedback.in[0] <== feedbackSource;
   gteFeedback.in[1] <== feedbackTarget;
   gteFeedback.out === 1;

   component gteItems = GreaterEqThan(252);
   gteItems.in[0] <== itemsSource;
   gteItems.in[1] <== itemsTarget;
   gteItems.out === 1;
}

component main {public [feedbackTarget, itemsTarget]} = Reputation();
