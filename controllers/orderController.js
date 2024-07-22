import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import axios from "axios";
import uniqid from "uniqid";
import sha256 from "sha256";
// const axios = require("axios");

// Phone pe config
const PHONE_PE_HOST_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox";
const MERCHANT_ID = "PGTESTPAYUAT86";
const SALT_INDEX = 1;
const SALT_KEY = "96434309-7796-489d-8924-ab56988a6076";

// placing user order from frontend
const placeOrder = async (req, res) => {
  try {
    const newOrder = new orderModel({
      userId: req.body.userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
    });

    await newOrder.save();

    // now clear the user cart
    await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

    // phone pe payment integration
    const payEndPoint = "/pg/v1/pay";
    const merchantTransactionId = uniqid();
    const userId = 123;

    const payLoad = {
      merchantId: MERCHANT_ID,
      merchantTransactionId: merchantTransactionId,
      merchantUserId: req.body.userId,
      amount: req.body.amount * 100, //in paise
      redirectUrl: `http://localhost:4000/api/order/redirect-url/${merchantTransactionId}/${req.body.userId}`,
      redirectMode: "REDIRECT",
      // callbackUrl: "https://webhook.site/callback-url",
      mobileNumber: "9999999999",
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };

    // SHA256(base64 encoded payload + “/pg/v1/pay” + salt key) + ### + salt index
    const bufferObj = Buffer.from(JSON.stringify(payLoad), "utf8");
    const base64 = bufferObj.toString("base64");
    const xVerify =
      sha256(base64 + payEndPoint + SALT_KEY) + "###" + SALT_INDEX;

    const options = {
      method: "post",
      url: `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay`,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-VERIFY": xVerify,
      },
      data: {
        request: base64,
      },
    };
    axios
      .request(options)
      .then(function (response) {
        console.log(response.data);
        const url = response?.data?.data?.instrumentResponse?.redirectInfo?.url;
        // res.redirect(url);
        res.json({ url: url });
        res.send(response.data);
      })
      .catch(function (error) {
        // res.json({ success: false, error });
        console.error(error);
      });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// PAY - phonepe
const payIntegration = async (req, res) => {
  const payEndPoint = "/pg/v1/pay";
  const merchantTransactionId = uniqid();
  const userId = 123;

  const payLoad = {
    merchantId: MERCHANT_ID,
    merchantTransactionId: merchantTransactionId,
    merchantUserId: "123",
    amount: 30000, //in paise
    redirectUrl: `http://localhost:4000/api/order/redirect-url/${merchantTransactionId}`,
    redirectMode: "REDIRECT",
    // callbackUrl: "https://webhook.site/callback-url",
    mobileNumber: "9999999999",
    paymentInstrument: {
      type: "PAY_PAGE",
    },
  };

  // SHA256(base64 encoded payload + “/pg/v1/pay” + salt key) + ### + salt index
  const bufferObj = Buffer.from(JSON.stringify(payLoad), "utf8");
  const base64 = bufferObj.toString("base64");
  const xVerify = sha256(base64 + payEndPoint + SALT_KEY) + "###" + SALT_INDEX;

  const options = {
    method: "post",
    url: `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay`,
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "X-VERIFY": xVerify,
    },
    data: {
      request: base64,
    },
  };
  axios
    .request(options)
    .then(function (response) {
      console.log(response.data);
      const url = response?.data?.data?.instrumentResponse?.redirectInfo?.url;
      // res.redirect(url);
      res.json({ url: url });
      res.send(response.data);
    })
    .catch(function (error) {
      // res.json({ success: false, error });
      console.error(error);
    });
};

// verify order - phonepe
const redirectUrl = async (req, res) => {
  const { merchantTransactionId, userId } = req.params;
  if (merchantTransactionId) {
    // SHA256(“/pg/v1/status/{merchantId}/{merchantTransactionId}” + saltKey) + “###” + saltIndex
    const xVerify =
      sha256(
        `/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}` + SALT_KEY
      ) +
      "###" +
      SALT_INDEX;

    const options = {
      method: "get",
      url: `${PHONE_PE_HOST_URL}/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}`,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-MERCHANT-ID": merchantTransactionId,
        "X-VERIFY": xVerify,
      },
    };

    axios
      .request(options)
      .then(function (response) {
        console.log(response.data);

        if (response.data.code === "PAYMENT_SUCCESS") {
          // redirect frontend - verify page
          res.redirect(
            `http://localhost:5173/verify?success=true&orderId=${userId}`
          );
        } else {
          // redirect frontend - verify page
          res.redirect(
            `http://localhost:5173/verify?success=false&orderId=${userId}`
          );
        }

        res.send(response.data);
      })
      .catch(function (error) {
        console.error(error);
      });
  } else {
    res.send({ error: "Error" });
  }
};

// Now verify order after payment done [Best way use webhook] - after payment done pass details from param from frontend to backend
const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body;

  try {
    if (success === "true") {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      res.json({ success: true, message: "Paid" });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false, message: "Not Paid" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

export { placeOrder, verifyOrder, payIntegration, redirectUrl };
