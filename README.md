# navcoin-js hackathon

This is my project for the navcoin-js hackathon. 

General hackathon guidelines were to build a privacy-focused app that makes creative use of the xNAV currency.

## idea

My idea revolved around generating gift codes which are supposed to act as a temporary storage for the NAV currency.

Consider Alice generating a gift code for Bob. Some possible use cases:
- Bob does not have a wallet yet, as having a gift code would motivate Bob to create one
- Bob prefers not to share his receiving adress
- Bob does not have his receiving address by hand
- Alice would like to temporarily store some of her funds outside of her main wallet  

## features 

### generating gift code

Gift codes can be generated under Gifts tab. After a successful transaction a dialog with show up with both a QR code and a text form which can be copied to clipboard.

![Generating gift code](demo/generateGiftCodeNAV.gif)

### redeeming a gift code

Gift codes can be redeemed on the Gifts tab. After a gift code has been redeemed successfully, the transaction will appear along with other transactions and have a small gift icon indicating it comes from a gift code.

![Redeem to existing wallet](demo/redeemRegular.gif)

### redeeming a gift code without a wallet

Aimed at users without a wallet, there is an option to redeem a gift code along with new wallet creation.

![Redeem without a wallet](demo/redeemOnCreate.gif)

## notes

As this was one of my first experiences interacting with blockchain and my first time using React, the project is not as polished as I would like it to be! Nevertheless I'm happy with the way it turned out and how much I learned in the process.

## instructions to run locally

Clone the repo, install the npm packages using `npm install` and start the application using `yarn start`.