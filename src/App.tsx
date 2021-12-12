import React from "react";

import CssBaseline from "@material-ui/core/CssBaseline";
import { ThemeProvider } from "@material-ui/core/styles";

import Container from "./components/Container";
import MainMenu from "./components/MainMenu";

import themeOptions from "./themes/Default";
import Error from "./components/Error";
import Loading from "./components/Loading";

import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
} from "@material-ui/core";

import {
  AccountBalanceOutlined,
  MoveToInboxOutlined,
  PaymentOutlined,
  SettingsOutlined,
} from "@material-ui/icons";

import Balance from "./components/Balance";
import Settings from "./components/Settings";
import * as localforage from "localforage";
import Mnemonic from "./components/Mnemonic";
import AskPassword from "./components/AskPassword";
import xnav from "./assets/XNAV.png";
import nav from "./assets/NAV.png";
import Receive from "./components/Receive";
import Send from "./components/Send";
import ConfirmTx from "./components/ConfirmTx";
import Gift from "./components/Gift";
import { Observable, PartialObserver } from "rxjs";

themeOptions.spacing(10);

interface IAppState {
  walletName: string;
  walletList: string[];
  loadingWallet: boolean;
  connectingWallet: boolean;
  errorLoad: string;
  bottomNavigation: any;
  balances: {
    nav: { confirmed: number; pending: number };
    xnav: { confirmed: number; pending: number };
    cold: { confirmed: number; pending: number };
  };
  history: IWalletHistory[];
  syncProgress: number;
  pendingQueue: number;
  addresses: any;
  utxos: any;
  mnemonic: string;
  showMnemonic: boolean;
  askPassword: boolean;
  afterPassword: any;
  errorPassword: string;
  confirmTxText: string;
  showConfirmTx: boolean;
  toSendTxs: string[];
  blockHeight: number;
}

interface IWalletHistory {
  wallettxid: string;
  amount: number;
  type: string;
  confirmed: boolean;
  height: number;
  pos: number;
  timestamp: number;
  memos: string[];
}

interface IGiftTransferWrapper {
  walletObj: any;
  giftSrc: any;
}

const INITIAL_STATE: IAppState = {
  walletName: "",
  walletList: [],
  loadingWallet: false,
  connectingWallet: false,
  errorLoad: "",
  bottomNavigation: 0,
  balances: {
    nav: { confirmed: 0, pending: 0 },
    xnav: { confirmed: 0, pending: 0 },
    cold: { confirmed: 0, pending: 0 },
  },
  history: [],
  syncProgress: -1,
  pendingQueue: -1,
  addresses: {},
  utxos: [],
  mnemonic: "",
  showMnemonic: false,
  askPassword: false,
  afterPassword: undefined,
  errorPassword: "",
  confirmTxText: "",
  showConfirmTx: false,
  toSendTxs: [],
  blockHeight: -1,
};

class App extends React.Component<any, any> {
  public state: IAppState;
  public njs: any;
  public wallet: any;

  public mn = require('electrum-mnemonic');

  constructor(props: any) {
    super(props);
    this.state = {
      ...INITIAL_STATE,
    };
    this.njs = props.njs;
  }

  public async componentDidMount() {
    await this.updateWalletList();

    const alreadyLoaded: string =
      (await localforage.getItem("walletName")) || "";

    if (alreadyLoaded != "") {
      await this.loadWallet(alreadyLoaded, "", "", "", "", false, undefined);
    }
  }

  public async updateWalletList() {
    const wallets = await this.njs.wallet.WalletFile.ListWallets();
    this.setState({ walletList: wallets });
  }

  public async loadWallet(
    name: string,
    mnemonic: string,
    type: string,
    password: string,
    spendingPassword: string,
    zap: boolean,
    network: string | undefined
  ) {
    try {
      this.wallet = new this.njs.wallet.WalletFile({
        file: name,
        mnemonic: mnemonic,
        type: type,
        password: password,
        spendingPassword: spendingPassword,
        zapwallettxes: zap,
        network: network,
        log: true,
        adapter: "websql",
      });

      this.setState({
        loadingWallet: true,
        errorLoad: undefined,
      });

      this.wallet.on("db_load_error", async (e: string) => {
        await localforage.setItem("walletName", "");
        this.setState({
          loadingWallet: false,
          walletName: undefined,
          errorLoad:
            "Could not load the database. You introduced a wrong password or the data is corrupted.",
        });
      });

      this.wallet.on("db_closed", async () => {
        await localforage.setItem("walletName", "");
        this.setState({
          loadingWallet: false,
          walletName: undefined,
        });
      });

      this.wallet.on("loaded", async () => {
        const history = await this.wallet.GetHistory();

        await localforage.setItem("walletName", name);

        this.setState({
          loadingWallet: false,
          errorLoad: undefined,
          balances: await this.wallet.GetBalance(),
          utxos: await this.wallet.GetUtxos(0xff),
          stakingAddresses: await this.wallet.GetStakingAddresses(),
          addresses: await this.wallet.GetAllAddresses(),
          history: history,
          walletName: name,
        });

        await this.wallet.Connect();
      });

      this.wallet.on("new_staking_address", async (a: any, b: any) => {
        this.setState({
          stakingAddresses: await this.wallet.GetStakingAddresses(),
          addresses: await this.wallet.GetAllAddresses(),
        });
      });

      this.wallet.on(
        "sync_status",
        async (progress: number, pending: number) => {
          if (pending % 50 == 0) {
            const history: IWalletHistory[] = await this.wallet.GetHistory();

            this.setState({
              balances: await this.wallet.GetBalance(),
              history,
              utxos: await this.wallet.GetUtxos(0xff),
              addresses: await this.wallet.GetAllAddresses(),
            });
          }
          this.setState({ syncProgress: progress, pendingQueue: pending });
        }
      );

      this.wallet.on("sync_finished", async () => {
        const history: IWalletHistory[] = await this.wallet.GetHistory();

        this.setState({
          balances: await this.wallet.GetBalance(),
          history,
          utxos: await this.wallet.GetUtxos(0xff),
          addresses: await this.wallet.GetAllAddresses(),
        });
        this.setState({ syncProgress: 100, pendingQueue: 0 });
      });

      this.wallet.on("connected", (server: string) =>
        console.log(`connected to ${server}. waiting for sync`)
      );

      this.wallet.on("new_mnemonic", async (mnemonic: string) => {
        await this.updateWalletList();
        this.setState({ showMnemonic: true, mnemonic: mnemonic });
      });

      this.wallet.on("new_tx", async (entry: IWalletHistory) => {
        //console.log(entry);
      });

      this.wallet.on("new_block", (height: number) => {
        this.setState({ blockHeight: height });
      });

      await this.wallet.Load({ bootstrap: this.njs.wallet.xNavBootstrap });
    } catch (e) {
      console.log(e);
    }
  }

  public async onRemove(name?: string) {
    const { walletName } = this.state;
    this.wallet.Disconnect();
    this.njs.wallet.WalletFile.RemoveWallet(name || walletName);
    await localforage.setItem("walletName", "");
    await this.updateWalletList();
    this.setState({ bottomNavigation: 0, walletName: "" });
  }

  public async onClose() {
    this.wallet.Disconnect();
    this.wallet.CloseDb();
    await localforage.setItem("walletName", "");
    this.setState({ bottomNavigation: 0, walletName: "" });
  }

  public backToMainMenu() {
    this.setState({ errorLoad: undefined });
  }

  public async showMnemonic(password: string) {
    const mnemonic: string = await this.wallet.db.GetMasterKey(
      "mnemonic",
      password
    );

    if (mnemonic) {
      this.setState({
        showMnemonic: true,
        mnemonic,
        askPassword: false,
        afterPassword: undefined,
        errorPassword: "",
      });
    } else {
      this.setState({ errorPassword: "Wrong password!" });
    }
  }

  public onSend = async (
    from: string,
    to: string,
    amount: number,
    type = 0x1,
    address = undefined
  ) => {
    const afterFunc = async (password: string) => {
      const mnemonic: string = await this.wallet.db.GetMasterKey(
        "mnemonic",
        password
      );

      if (mnemonic) {
        this.setState({
          askPassword: false,
          afterPassword: undefined,
          errorPassword: "",
        });
        await this.onSendPassword(from, to, amount, password, type, address);
      } else {
        this.setState({ errorPassword: "Wrong password!" });
      }
    };
    if (await this.wallet.GetMasterKey("mnemonic", undefined)) {
      await afterFunc("");
    } else {
      this.setState({
        askPassword: true,
        afterPassword: afterFunc,
        errorPassword: "",
      });
    }
  };

  public onSendPassword = async (
    from: string,
    to: string,
    amount: number,
    password = "",
    type = 0x1,
    address = undefined
  ) => {
    if (from == "nav" || from == "staked") {
      try {
        const txs = await this.wallet.NavCreateTransaction(
          to,
          amount,
          "",
          password,
          true,
          100000,
          type,
          address
        );
        if (txs) {
          this.setState({
            showConfirmTx: true,
            confirmTxText: `${amount / 1e8} ${from} to ${to} Fee: ${
              txs.fee / 1e8
            }`,
            toSendTxs: txs.tx,
          });
        } else {
          this.setState({
            errorLoad: "Could not create transaction.",
            showConfirmTx: false,
            confirmTxText: "",
            toSendTxs: [],
          });
        }
      } catch (e: any) {
        this.setState({
          errorLoad: e.toString(),
          showConfirmTx: false,
          confirmTxText: "",
          toSendTxs: [],
        });
      }
    } else if (from == "xnav") {
      try {
        const txs = await this.wallet.xNavCreateTransaction(
          to,
          amount,
          "",
          password
        );
        if (txs) {
          this.setState({
            showConfirmTx: true,
            confirmTxText: `${amount / 1e8} ${from} to ${to} Fee: ${
              txs.fee / 1e8
            }`,
            toSendTxs: txs.tx,
          });
        } else {
          this.setState({
            errorLoad: "Could not create transaction.",
            showConfirmTx: false,
            confirmTxText: "",
            toSendTxs: [],
          });
        }
      } catch (e: any) {
        this.setState({
          errorLoad: e.toString(),
          showConfirmTx: false,
          confirmTxText: "",
          toSendTxs: [],
        });
      }
    }
  };

  public onGift = async (
    from: string,
    to: string,
    amount: number,
    type = 0x1,
  ) => {
    const afterFunc = async (password: string) => {
      const mnemonic: string = await this.wallet.db.GetMasterKey(
        "mnemonic",
        password
      );
      if (mnemonic) {
        this.setState({
          askPassword: false,
          afterPassword: undefined,
          errorPassword: "",
        });
        await this.onGiftPassword(from, to, amount, type);
      } else {
        this.setState({ errorPassword: "Wrong password!" });
      }
    };
    if (await this.wallet.GetMasterKey("mnemonic", undefined)) {
      await afterFunc("");
    } else {
      this.setState({
        askPassword: true,
        afterPassword: afterFunc,
        errorPassword: "",
      });
    }
  };

  public onGiftPassword = async (
    from: string,
    to: string,
    amount: number,
    type = 0x1,
    password = "",
    address = undefined
  ) => {

    const name = (Math.random() + 1).toString(36).substring(5);
    const walletPassword = (Math.random() + 1).toString(36).substring(5);
    const spendingPassword = (Math.random() + 1).toString(36).substring(5);
    
    const wallet = await this.generateTempWallet(name, walletPassword, spendingPassword);

    const xNavAddress = (await wallet.xNavReceivingAddresses(false))[0].address;
    const navAddress = (await wallet.NavReceivingAddresses(false))[0].address;

    if (from == "nav") {
      try {
        const txs = await this.wallet.NavCreateTransaction(
          navAddress,
          amount,
          "",
          password,
          true,
          100000,
          type,
          address,
        );
        if (txs) {
          this.setState({
            showConfirmTx: true,
            confirmTxText: `${amount / 1e8} ${from}  for gift voucher, Fee: ${
              txs.fee / 1e8
            }`,
            toSendTxs: txs.tx,
          });

          const walletToEncode = {
            name,
            mnemonic: wallet.tempMnemonicStore,
            password: walletPassword,
            spendingPassword,
            network: this.wallet.network,
            transactionType: `nav`,
            amt: amount - txs.fee,
          }

          // encode wallet as gift code
          const buff = Buffer.from(JSON.stringify(walletToEncode));
          const encodedWallet: string = buff.toString("base64");
          console.log(`encoded wallet: ${encodedWallet}`);
          console.log(`transferring funds to gift wallet: `);
          const tx = await this.wallet.SendTransaction(txs.tx);
          console.log(tx);
        } else {
          this.setState({
            errorLoad: "Could not create transaction.",
            showConfirmTx: false,
            confirmTxText: "",
            toSendTxs: [],
          });
        }
      } catch (e: any) {
        this.setState({
          errorLoad: e.toString(),
          showConfirmTx: false,
          confirmTxText: "",
          toSendTxs: [],
        });
      }
    } else if (from == "xnav") {
      try {
        const txs = await this.wallet.xNavCreateTransaction(
          xNavAddress,
          amount,
          "",
          password
        );
        if (txs) {
          this.setState({
            showConfirmTx: true,
            confirmTxText: `${amount / 1e8} ${from} for gift voucher, Fee: ${
              txs.fee / 1e8
            }`,
            toSendTxs: txs.tx,
          });
          const walletToEncode = {
            name,
            mnemonic: wallet.tempMnemonicStore,
            password: walletPassword,
            spendingPassword,
            network: this.wallet.network,
            transactionType: `xnav`,
            amt: amount - txs.fee,
          }
      
          const buff = Buffer.from(JSON.stringify(walletToEncode));
          console.log(`encoded wallet: ${buff.toString("base64")}`);
          console.log(`transferring funds to gift wallet: `);
          const tx = await this.wallet.SendTransaction(txs.tx);
          console.log(tx);
        } else {
          this.setState({
            errorLoad: "Could not create transaction.",
            showConfirmTx: false,
            confirmTxText: "",
            toSendTxs: [],
          });
        }
      } catch (e: any) {
        this.setState({
          errorLoad: e.toString(),
          showConfirmTx: false,
          confirmTxText: "",
          toSendTxs: [],
        });
      }
    }
  };

  private async generateTempWallet(name: string, password: string, spendingPassword: string): Promise<any> {
    
    // const type = 'navcoin-js-v1';
    const network = this.wallet.network;
    
    let newMnemonic = ``;
    
    const wallet = new this.njs.wallet.WalletFile({
      file: name,
      network,
      password,
      spendingPassword,
      log: true,
    });
    // sub to mnemonic to retrieve it later on
    wallet.on('new_mnemonic', (mnemonic: string) => newMnemonic = mnemonic);

    try {
      await wallet.Load();
      console.log(wallet);
      wallet.tempMnemonicStore = newMnemonic;
    } catch (e) {
      console.log(e);
    }
    return wallet;
  }

  public giftCodeToWalletObj(giftWalletSrc: any): any {

    const giftWallet = new this.njs.wallet.WalletFile({
      file: giftWalletSrc.name,
      mnemonic: giftWalletSrc.mnemonic,
      type: `navcoin-js-v1`,
      password: giftWalletSrc.password,
      spendingPassword: giftWalletSrc.spendingPassword,
      network: giftWalletSrc.network,
      log: true,
      adapter: "websql",
    });
    return giftWallet;
  }

  public onRedeemGiftCode = async (
    giftCode: string,
    privateAddress: string,
    publicAddress: string,
  ) => {
    try {
      const decodedGiftCode = Buffer.from(giftCode, 'base64');
      const giftWalletSrc = JSON.parse(decodedGiftCode.toString('ascii'));
      const giftWallet = this.giftCodeToWalletObj(giftWalletSrc);

      const giftObservable$ = new Observable<IGiftTransferWrapper>();
      const giftObserver = {
        next: async (giftInfo: IGiftTransferWrapper) => {
          console.log(await giftInfo.walletObj.GetBalance());
          if (giftInfo != undefined) {
            if (giftInfo.giftSrc.transactionType == `nav`) {
              console.log(`attempting to transfer nav:`);
              try {
                const txs = await giftInfo.walletObj.NavCreateTransaction(
                  publicAddress,
                  (await giftInfo.walletObj.GetBalance()).nav.confirmed,
                  undefined,
                  giftInfo.giftSrc.spendingPassword,
                  true,
                  10000,
                  0x1,
                );
                if (txs) {
                  this.setState({
                    showConfirmTx: true,
                    showConfirmText: true,
                    confirmTxText: `You wish to redeem gift code of ${giftInfo.giftSrc.amt} ${giftInfo.giftSrc.transactionType}?`,
                    toSendTxs: txs.tx,
                  })
                } else {
                  this.setState({
                    errorLoad: "Could not redeem gift code. Try again in a minute.",
                  });
                }
              } catch (e: any) {
                this.setState({
                  errorLoad: "Could not redeem gift code. Try again in a minute.",
                });
              }
            } else {
              console.log(`attempting to transfer xnav:`);
              try {
                const txs = await giftInfo.walletObj.xNavCreateTransaction(
                  privateAddress,
                  (await giftInfo.walletObj.GetBalance()).xnav.confirmed,
                  undefined,
                  giftInfo.giftSrc.spendingPassword,
                  true,
                );
                if (txs) {
                  this.setState({
                    showConfirmTx: true,
                    showConfirmText: true,
                    confirmTxText: `You wish to redeem gift code of ${giftInfo.giftSrc.amt} ${giftInfo.giftSrc.transactionType}?`,
                    toSendTxs: txs.tx,
                  })
                } else {
                  this.setState({
                    errorLoad: "Could not redeem gift code. Try again in a minute.",
                  });
                }
              } catch (e) {
                this.setState({
                  errorLoad: "Could not redeem gift code. Try again in a minute.",
                });
              }
            }            
          }
        },
        error: (err: any) => console.error('Observer got an error'),
        complete: () => console.log('Observer got a complete notification'),
      };

      giftObservable$.subscribe(giftObserver);


      giftWallet.on("loaded", async () => {
        await giftWallet.Connect();
        console.log((await giftWallet.GetBalance()));
        giftObserver.next({
          walletObj: giftWallet,
          giftSrc: giftWalletSrc,
        });
      });

      await giftWallet.Load();
    } catch (error) {
      console.log(`error redeeming gift card: ${error}`);
    }
  };

  public render = () => {
    const {
      walletName,
      walletList,
      loadingWallet,
      errorLoad,
      bottomNavigation,
      connectingWallet,
      balances,
      history,
      syncProgress,
      pendingQueue,
      showMnemonic,
      mnemonic,
      askPassword,
      afterPassword,
      errorPassword,
      utxos,
      addresses,
      confirmTxText,
      showConfirmTx,
      toSendTxs,
      blockHeight,
    } = this.state;

    return (
      <ThemeProvider theme={themeOptions}>
        <CssBaseline />
        <Container>
          <Mnemonic
            open={showMnemonic}
            mnemonic={mnemonic}
            onClose={() => {
              this.setState({ mnemonic: "", showMnemonic: false });
            }}
          />
          <ConfirmTx
            open={showConfirmTx}
            text={confirmTxText}
            onClose={() => {
              this.setState({
                confirmTxText: "",
                showConfirmTx: false,
                toSendTxs: [],
              });
            }}
            onOk={() => {
              try {
                this.wallet.SendTransaction(toSendTxs);
              } catch (e: any) {
                this.setState({
                  errorLoad: e.toString(),
                  showConfirmTx: false,
                  confirmTxText: "",
                  toSendTxs: [],
                });
              }
              this.setState({
                confirmTxText: "",
                showConfirmTx: false,
                toSendTxs: [],
                bottomNavigation: 0,
              });
            }}
          />
          <AskPassword
            open={askPassword}
            onAccept={afterPassword}
            onClose={() => {
              this.setState({
                askPassword: false,
                afterPassword: undefined,
                errorPassword: "",
              });
            }}
            error={errorPassword}
          />
          {errorLoad ? (
            <Error
              actions={[
                {
                  text: "ok",
                  action: () => {
                    this.backToMainMenu();
                  },
                },
              ]}
            >
              {errorLoad}
            </Error>
          ) : !walletName ? (
            <MainMenu
              wallets={walletList}
              onLoad={async (
                name: string,
                mnemonic: string,
                type: string,
                password: string,
                spendingPassword: string,
                zap: boolean,
                network: string
              ) => {
                await this.loadWallet(
                  name,
                  mnemonic,
                  type,
                  password,
                  spendingPassword,
                  zap,
                  network
                );
              }}
            />
          ) : loadingWallet ? (
            <Loading>Loading wallet...</Loading>
          ) : connectingWallet ? (
            <Loading>Connecting to the network...</Loading>
          ) : (
            <>
              {bottomNavigation == 0 ? (
                <Balance
                  balances={balances}
                  history={history}
                  syncProgress={syncProgress}
                  pendingQueue={pendingQueue}
                  onSwap={() => {
                    this.setState({ bottomNavigation: 4 });
                  }}
                  onStake={() => {
                    this.setState({ bottomNavigation: 5 });
                  }}
                />
              ) : bottomNavigation == 1 ? (
                <Send
                  wallet={this.njs.wallet}
                  network={this.wallet.network}
                  balance={balances}
                  onSend={this.onSend}
                />
              ) : bottomNavigation == 2 ? (
                <Receive addresses={addresses}></Receive>
              ) : bottomNavigation == 3 ? (
                <Settings
                  onClose={() => {
                    this.onClose();
                  }}
                  onRemove={() => {
                    this.onRemove();
                  }}
                  blockHeight={blockHeight}
                  onMnemonic={async () => {
                    const afterFunc = async (password: string) => {
                      await this.showMnemonic(password);
                    };
                    if (await this.wallet.GetMasterKey("mnemonic", undefined)) {
                      await afterFunc("");
                    } else {
                      this.setState({
                        askPassword: true,
                        afterPassword: afterFunc,
                        errorPassword: "",
                      });
                    }
                  }}
                  walletName={walletName}
                  network={this.wallet.network}
                ></Settings>
              ) : bottomNavigation == 4 ? (
                <Gift
                  wallet={this.njs.wallet}
                  network={this.wallet.network}
                  balance={balances}
                  onGift={this.onGift}
                  onRedeemGiftCode={this.onRedeemGiftCode}
                  addresses={addresses}
                  njs={this.njs}
                />
              ) : (
                <>Unknown</>
              )}
              <Paper
                sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}
                elevation={10}
              >
                <BottomNavigation
                  showLabels
                  value={bottomNavigation}
                  onChange={(event, newValue) => {
                    this.setState({ bottomNavigation: newValue });
                  }}
                >
                  <BottomNavigationAction
                    label="Home"
                    icon={<AccountBalanceOutlined />}
                  />
                  <BottomNavigationAction
                    label="Send"
                    icon={<PaymentOutlined />}
                  />
                  <BottomNavigationAction
                    label="Receive"
                    icon={<MoveToInboxOutlined />}
                  />
                  <BottomNavigationAction
                      label="Settings"
                      icon={<SettingsOutlined />}
                  />
                  <BottomNavigationAction
                      label="Gifts"
                      icon={<PaymentOutlined />}
                  />
                </BottomNavigation>
              </Paper>
            </>
          )}
        </Container>
      </ThemeProvider>
    );
  };
}

export default App;