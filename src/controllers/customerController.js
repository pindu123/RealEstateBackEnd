const { customerSchema } = require("../helpers/customerValidation");
const customerModel = require("../models/customerModel");
const fs = require("fs");
const twilio = require("twilio");
const nodemailer = require("nodemailer");

const axios = require("axios");

const createCustomer = async (req, res) => {
  try {
    const customers = req.body;
    for (let customerData of customers) {
      await customerSchema.validateAsync(customerData);
      const customer = new customerModel(customerData);
      await customer.save();
    }
    res.status(201).json("Customer Entered Successfully");
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
};
const getCustomer = async (req, res) => {
  try {
    const customerData = await customerModel.find();

    res.status(200).json(customerData);
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
};

// const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
// const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
// const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER;

// const EMAIL_USER = process.env.EMAIL_USER;
// const EMAIL_PASS = process.env.EMAIL_PASS;

// // helper function for WhatsApp with multiple properties in one message
// const sendWhatsAppMessageWithMultipleProperties = async (
//   messageBody,
//   contactValue,
//   imageUrls
// ) => {
//   const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

//   // Send a single WhatsApp message containing all property details
//   await client.messages.create({
//     from: `${TWILIO_WHATSAPP_NUMBER}`,
//     to: `whatsapp:${"+91"}${contactValue}`,
//     body: messageBody,
//     mediaUrl: imageUrls, // Media URLs array
//   });
// };

// // Modified helper function for email with multiple properties
// const sendEmailWithMultipleProperties = async (
//   messageBody,
//   contactValue,
//   propertyImages
// ) => {
//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: EMAIL_USER,
//       pass: EMAIL_PASS,
//     },
//   });

//   // Prepare attachments with CID for inline display
//   const attachments = propertyImages.map((imageUrl, index) => ({
//     filename: `property_image_${index + 1}.jpg`,
//     path: imageUrl,
//     cid: `property_image_${index + 1}`, // Content-ID for inline images
//   }));

//   // Add inline images with <img> tags in the HTML content
//   const htmlContent = propertyImages
//     .map(
//       (imageUrl, index) =>
//         `<div><h3>Property ${index + 1}</h3><p>${
//           messageBody[index]
//         }</p><img src="cid:property_image_${
//           index + 1
//         }" style="width: 100%; max-width: 500px;"/></div>`
//     )
//     .join("");

//   const mailOptions = {
//     from: EMAIL_USER,
//     to: contactValue,
//     subject: "Property Details",
//     html: `<html><body>${htmlContent}</body></html>`, // HTML content with inline images
//     attachments: attachments, // Attach the images with CID for inline display
//   };

//   await transporter.sendMail(mailOptions);
// };

// // Controller for sending combined property details to customer
// const sendPropertyDetailsToCustomer = async (req, res) => {
//   try {
//     const propertyData = req.body.propertyData;
//     const customerData = req.body.customerData;

//     if (!propertyData || !customerData) {
//       return res
//         .status(400)
//         .json({ message: "Property data and customer data are required" });
//     }

//     const { name, contactType, contactValue } = customerData;
//     const { properties } = propertyData;

//     if (!properties || properties.length === 0) {
//       return res.status(400).json({ message: "No properties available" });
//     }

//     // message body
//     const messageBodies = [];
//     const propertyImages = [];
//     properties.forEach((property, index) => {
//       messageBodies.push(
//         `Hello ${name},\n\nHere are the details for Property ${
//           index + 1
//         }:\n\nName: ${property.name}\nLocation: ${property.district}\nPrice: ${
//           property.price
//         }\n Property Size: ${property.size}`
//       );
//       propertyImages.push(property.imageUrl); // Collect image URLs
//     });

//     if (contactType === "whatsapp") {
//       // Send a single WhatsApp message with multiple property details
//       const combinedMessageBody = messageBodies.join("\n\n"); // Combine messages into one
//       await sendWhatsAppMessageWithMultipleProperties(
//         combinedMessageBody,
//         contactValue,
//         propertyImages
//       );
//     } else if (contactType === "email") {
//       // Send an email with all property details and images inline
//       await sendEmailWithMultipleProperties(
//         messageBodies,
//         contactValue,
//         propertyImages
//       );
//     } else {
//       return res
//         .status(400)
//         .json({ message: 'Invalid contact type. Use "whatsapp" or "email".' });
//     }

//     return res
//       .status(200)
//       .json({ message: "Property details sent successfully" });
//   } catch (error) {
//     console.error("Error processing request:", error);
//     return res
//       .status(500)
//       .json({ message: "Error processing property details", error });
//   }
// };
// const PDFDocument = require("pdfkit");
// const cloudinary = require("cloudinary").v2;

// // Configure Cloudinary for file upload
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// const generatePropertyPDF = async (properties, customerName) => {
//   const doc = new PDFDocument({ margin: 50 });
//   const filePath = `./property_details_${Date.now()}.pdf`;

//   return new Promise((resolve, reject) => {
//     const stream = fs.createWriteStream(filePath);
//     doc.pipe(stream);

//     // Add a title
//     doc
//       .fontSize(20)
//       .font("Helvetica-Bold")
//       .text(`Property Details for ${customerName}`)
//       .moveDown(2);

//     const addPropertyDetails = async () => {
//       for (const [index, property] of properties.entries()) {
//         // Section Title for Property
//         doc
//           .fontSize(16)
//           .font("Helvetica-Bold")
//           .text(`Property ${index + 1}`, { underline: true })
//           .moveDown(0.5);
//         // Add Image directly after details
//         if (property.imageUrl) {
//           try {
//             const response = await axios.get(property.imageUrl, {
//               responseType: "arraybuffer",
//             });
//             const imgBuffer = Buffer.from(response.data, "binary");
//             doc
//               .image(imgBuffer, { fit: [500, 100], align: "right" })
//               .moveDown(1);
//             doc.moveDown(1.0);
//           } catch (error) {
//             console.error(
//               `Failed to load image for Property ${index + 1}:`,
//               error.message
//             );
//             doc.fontSize(12).text("Image not available").moveDown(1);
//           }
//         } else {
//           doc.fontSize(12).text("Image not available").moveDown(1);
//         }

//         // Property Details
//         doc
//           .fontSize(12)
//           .font("Helvetica")
//           .text(`Name: `, { continued: true })
//           .font("Helvetica-Bold")
//           .text(property.name)
//           .moveDown(0.5);

//         doc
//           .fontSize(12)
//           .font("Helvetica")
//           .text(`Location: `, { continued: true })
//           .font("Helvetica-Bold")
//           .text(property.district)
//           .moveDown(0.5);

//         doc
//           .fontSize(12)
//           .font("Helvetica")
//           .text(`Price: `, { continued: true })
//           .font("Helvetica-Bold")
//           .text(property.price)
//           .moveDown(0.5);

//         doc
//           .fontSize(12)
//           .font("Helvetica")
//           .text(`Property Size: `, { continued: true })
//           .font("Helvetica-Bold")
//           .text(property.size)
//           .text(" sqft")
//           .moveDown(0.5);

//         // Add a divider line between properties
//         if (index < properties.length - 1) {
//           doc
//             .moveDown(0.5)
//             .strokeColor("#cccccc")
//             .lineWidth(1)
//             .moveTo(doc.page.margins.left, doc.y)
//             .lineTo(doc.page.width - doc.page.margins.right, doc.y)
//             .stroke();
//           doc.moveDown(2.5);
//         }
//       }
//     };

//     addPropertyDetails()
//       .then(() => {
//         doc.end();
//         stream.on("finish", () => resolve(filePath));
//         stream.on("error", reject);
//       })
//       .catch(reject);
//   });
// };

// const uploadPDFToCloudinary = async (filePath) => {
//   const result = await cloudinary.uploader.upload(filePath, {
//     resource_type: "raw",
//   });

//   const fileUrl = result.secure_url;
//   console.log(fileUrl, " in uploading file to cloudinary");

//   return fileUrl;
// };

// // Function to send WhatsApp message with PDF
// const sendWhatsAppWithPDF = async (contactValue, pdfUrl) => {
//   try {
//     console.log(pdfUrl, " in sending whatsapp initial step url fetching");
//     const message = await client.messages.create({
//       from: `${TWILIO_WHATSAPP_NUMBER}`,
//       to: `whatsapp:${"+91"}${contactValue}`,
//       body: "Please find the attached PDF with property details.",
//       mediaUrl: pdfUrl,
//     });
//     console.log("Message sent successfully:", message);
//   } catch (error) {
//     console.error("Error sending message:", error);
//     throw new Error("Failed to send WhatsApp message");
//   }
// };

// // Controller function to handle request
// const sendPropertyToCustomer = async (req, res) => {
//   try {
//     const { propertyData, customerData } = req.body;

//     if (!propertyData || !customerData) {
//       return res
//         .status(400)
//         .json({ message: "Property data and customer data are required" });
//     }

//     const { name, contactType, contactValue } = customerData;
//     const { properties } = propertyData;

//     if (!properties || properties.length === 0) {
//       return res.status(400).json({ message: "No properties available" });
//     }

//     // Generate the PDF
//     const pdfPath = await generatePropertyPDF(properties, name);

//     if (contactType === "email") {
//       // Send PDF via email
//       await sendEmailWithPDF(contactValue, pdfPath);
//       res.status(200).json({ message: "Property details sent via Email" });
//     } else if (contactType === "whatsapp") {
//       // Upload PDF to Cloudinary
//       const pdfUrl = await uploadPDFToCloudinary(pdfPath);
//       console.log(pdfUrl, " pdf url while sending message");
//       // Send PDF via WhatsApp
//       await sendWhatsAppWithPDF(contactValue, pdfUrl);
//       res.status(200).json({ message: "Property details sent via WhatsApp" });
//     } else {
//       res
//         .status(400)
//         .json({ message: 'Invalid contact type. Use "whatsapp" or "email".' });
//     }

//     // Clean up the generated PDF file
//     fs.unlinkSync(pdfPath);
//   } catch (error) {
//     console.error("Error processing request:", error);
//     res
//       .status(500)
//       .json({ message: "Error processing property details", error });
//   }
// };

// // Function to send Email with PDF attachment
// const sendEmailWithPDF = async (contactValue, pdfPath) => {
//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });

//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: contactValue,
//     subject: "Property Details",
//     text: "Please find the attached PDF with property details.",
//     attachments: [
//       {
//         filename: "Property_Details.pdf",
//         path: pdfPath,
//       },
//     ],
//   };

//   await transporter.sendMail(mailOptions);
// };

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER;

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

// helper function for WhatsApp with multiple properties in one message
const sendWhatsAppMessageWithMultipleProperties = async (
  messageBody,
  contactValue,
  imageUrls
) => {
  const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

  // Send a single WhatsApp message containing all property details
  await client.messages.create({
    from: `${TWILIO_WHATSAPP_NUMBER}`,
    to: `whatsapp:${"+91"}${contactValue}`,
    body: messageBody,
    mediaUrl: imageUrls, // Media URLs array
  });
};

// Modified helper function for email with multiple properties
const sendEmailWithMultipleProperties = async (
  messageBody,
  contactValue,
  propertyImages
) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  // Prepare attachments with CID for inline display
  const attachments = propertyImages.map((imageUrl, index) => ({
    filename: `property_image_${index + 1}.jpg`,
    path: imageUrl,
    cid: `property_image_${index + 1}`, // Content-ID for inline images
  }));

  // Add inline images with <img> tags in the HTML content
  const htmlContent = propertyImages
    .map(
      (imageUrl, index) =>
        `<div><h3>Property ${index + 1}</h3><p>${
          messageBody[index]
        }</p><img src="cid:property_image_${
          index + 1
        }" style="width: 100%; max-width: 500px;"/></div>`
    )
    .join("");

  const mailOptions = {
    from: EMAIL_USER,
    to: contactValue,
    subject: "Property Details",
    html: `<html><body>${htmlContent}</body></html>`, // HTML content with inline images
    attachments: attachments, // Attach the images with CID for inline display
  };

  await transporter.sendMail(mailOptions);
};

// Controller for sending combined property details to customer
const sendPropertyDetailsToCustomer = async (req, res) => {
  try {
    const propertyData = req.body.propertyData;
    const customerData = req.body.customerData;

    if (!propertyData || !customerData) {
      return res
        .status(400)
        .json({ message: "Property data and customer data are required" });
    }

    const { name, contactType, contactValue } = customerData;
    const { properties } = propertyData;

    if (!properties || properties.length === 0) {
      return res.status(400).json({ message: "No properties available" });
    }

    // message body
    const messageBodies = [];
    const propertyImages = [];
    properties.forEach((property, index) => {
      messageBodies.push(
        `Hello ${name},\n\nHere are the details for Property ${
          index + 1
        }:\n\nName: ${property.name}\nLocation: ${property.district}\nPrice: ${
          property.price
        }\n Property Size: ${property.size}`
      );
      propertyImages.push(property.imageUrl); // Collect image URLs
    });

    if (contactType === "whatsapp") {
      // Send a single WhatsApp message with multiple property details
      const combinedMessageBody = messageBodies.join("\n\n"); // Combine messages into one
      await sendWhatsAppMessageWithMultipleProperties(
        combinedMessageBody,
        contactValue,
        propertyImages
      );
    } else if (contactType === "email") {
      // Send an email with all property details and images inline
      await sendEmailWithMultipleProperties(
        messageBodies,
        contactValue,
        propertyImages
      );
    } else {
      return res
        .status(400)
        .json({ message: 'Invalid contact type. Use "whatsapp" or "email".' });
    }

    return res
      .status(200)
      .json({ message: "Property details sent successfully" });
  } catch (error) {
    console.error("Error processing request:", error);
    return res
      .status(500)
      .json({ message: "Error processing property details", error });
  }
};
const PDFDocument = require("pdfkit");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary for file upload
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

const generatePropertyPDF = async (properties, customerName) => {
  const doc = new PDFDocument({ margin: 50 });
  const filePath = `./property_details_${Date.now()}.pdf`;

  return new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Add a title
    doc
      .fontSize(20)
      .font("Helvetica-Bold")
      .text(`Property Details for ${customerName}`)
      .moveDown(2);

    const addPropertyDetails = async () => {
      for (const [index, property] of properties.entries()) {
        // Section Title for Property
        doc
          .fontSize(16)
          .font("Helvetica-Bold")
          .text(`Property ${index + 1}`, { underline: true })
          .moveDown(0.5);
        // Add Image directly after details
        if (property.imageUrl) {
          try {
            const response = await axios.get(property.imageUrl, {
              responseType: "arraybuffer",
            });
            const imgBuffer = Buffer.from(response.data, "binary");
            doc
              .image(imgBuffer, { fit: [500, 100], align: "right" })
              .moveDown(1);
            doc.moveDown(1.0);
          } catch (error) {
            console.error(
              `Failed to load image for Property ${index + 1}:`,
              error.message
            );
            doc.fontSize(12).text("Image not available").moveDown(1);
          }
        } else {
          doc.fontSize(12).text("Image not available").moveDown(1);
        }

        // Property Details
        doc
          .fontSize(12)
          .font("Helvetica")
          .text(`Name: `, { continued: true })
          .font("Helvetica-Bold")
          .text(property.name)
          .moveDown(0.5);

        doc
          .fontSize(12)
          .font("Helvetica")
          .text(`Location: `, { continued: true })
          .font("Helvetica-Bold")
          .text(property.district)
          .moveDown(0.5);

        doc
          .fontSize(12)
          .font("Helvetica")
          .text(`Price: `, { continued: true })
          .font("Helvetica-Bold")
          .text(property.price)
          .moveDown(0.5);

        doc
          .fontSize(12)
          .font("Helvetica")
          .text(`Property Size: `, { continued: true })
          .font("Helvetica-Bold")
          .text(property.size)
          .text(" sqft")
          .moveDown(0.5);

        // Add a divider line between properties
        if (index < properties.length - 1) {
          doc
            .moveDown(0.5)
            .strokeColor("#cccccc")
            .lineWidth(1)
            .moveTo(doc.page.margins.left, doc.y)
            .lineTo(doc.page.width - doc.page.margins.right, doc.y)
            .stroke();
          doc.moveDown(2.5);
        }
      }
    };

    addPropertyDetails()
      .then(() => {
        doc.end();
        stream.on("finish", () => resolve(filePath));
        stream.on("error", reject);
      })
      .catch(reject);
  });
};

const uploadPDFToCloudinary = async (filePath) => {
  const result = await cloudinary.uploader.upload(filePath, {
    resource_type: "raw",
  });

  const fileUrl = result.secure_url;
  console.log(fileUrl, " in uploading file to cloudinary");

  return fileUrl;
};

// Function to send WhatsApp message with PDF
const sendWhatsAppWithPDF = async (contactValue, pdfUrl) => {
  try {
    console.log(pdfUrl, " in sending whatsapp initial step url fetching");
    const message = await client.messages.create({
      from: `${TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${"+91"}${contactValue}`,
      body: "Please find the attached PDF with property details.",
      mediaUrl: pdfUrl,
    });
    console.log("Message sent successfully:", message);
  } catch (error) {
    console.error("Error sending message:", error);
    throw new Error("Failed to send WhatsApp message");
  }
};

// Controller function to handle request
const sendPropertyToCustomer = async (req, res) => {
  try {
    const { propertyData, customerData } = req.body;

    if (!propertyData || !customerData) {
      return res
        .status(400)
        .json({ message: "Property data and customer data are required" });
    }

    const { name, contactType, contactValue } = customerData;
    const { properties } = propertyData;

    if (!properties || properties.length === 0) {
      return res.status(400).json({ message: "No properties available" });
    }

    // Generate the PDF
    const pdfPath = await generatePropertyPDF(properties, name);

    if (contactType === "email") {
      // Send PDF via email
      await sendEmailWithPDF(contactValue, pdfPath);
      res.status(200).json({ message: "Property details sent via Email" });
    } else if (contactType === "whatsapp") {
      // Upload PDF to Cloudinary
      const pdfUrl = await uploadPDFToCloudinary(pdfPath);
      console.log(pdfUrl, " pdf url while sending message");
      // Send PDF via WhatsApp
      await sendWhatsAppWithPDF(contactValue, pdfUrl);
      res.status(200).json({ message: "Property details sent via WhatsApp" });
    } else {
      res
        .status(400)
        .json({ message: 'Invalid contact type. Use "whatsapp" or "email".' });
    }

    // Clean up the generated PDF file
    fs.unlinkSync(pdfPath);
  } catch (error) {
    console.error("Error processing request:", error);
    res
      .status(500)
      .json({ message: "Error processing property details", error });
  }
};

// Function to send Email with PDF attachment
const sendEmailWithPDF = async (contactValue, pdfPath) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: contactValue,
    subject: "Property Details",
    text: "Please find the attached PDF with property details.",
    attachments: [
      {
        filename: "Property_Details.pdf",
        path: pdfPath,
      },
    ],
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendPropertyToCustomer,
};

module.exports = {
  createCustomer,
  getCustomer,
  sendPropertyDetailsToCustomer,
  sendPropertyToCustomer,
  sendEmailWithPDF,
  sendWhatsAppWithPDF,
  generatePropertyPDF,
};