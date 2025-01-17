// Import necessary modules
const fieldModel = require("../models/fieldModel");
const propertyRatingModel = require("../models/propertyRatingModel");
const wishlistModel = require("../models/wishlistModel");
const { fieldValidationSchema } = require("../helpers/agricultureValidation");
const userModel = require("../models/userModel");
const notifyModel = require("../models/notificationModel");
const Counter = require("../models/counterModel");


// Get all fields which are added by that user
const getFields = async (req, res) => {
  try {
    const userId = req.user.user.userId;
    const fields = await fieldModel
      .find({ userId: userId })
      .sort({ status: 1, updatedAt: -1 });
    if (fields.length === 0) {
      return res.status(200).json({ data: [] });
    }
    res.status(200).send({ data: fields, count: fields.length });
  } catch (error) {
    res.status(500).json({ message: "Error fetching fields", error });
  }
};

// Create a new field
// const insertFieldDetails = async (req, res) => {
//   try {
//     const { userId, role } = req.user.user;
//     // console.log(req.user.user);
//     let fieldDetailsData;
//   req.body.amenities.electricity=String(req.body.amenities.electricity)

//     let message={}
//      if (role === 1) {
//       const csrData = await userModel.find({ _id: userId });
//       console.log("csrData", csrData.assignedCsr);
//       if (req.body.enteredBy) {
//         fieldDetailsData = {
//           userId,
//           csrId: csrData[0].assignedCsr,
//           role,
//           ...req.body,
 
//         };
//       } else {
//         const csrData = await userModel.find({ _id: userId });

//         console.log("abc");
//         fieldDetailsData = {
//           userId,
//           role,
//           enteredBy: userId,
//           csrId: csrData[0].assignedCsr,
//           ...req.body,

//          };
//       }  

// message={
//   "senderId":req.user.user.userId,
//   "receiverId":csrData[0].assignedCsr,
//      "message":`${csrData[0].firstName} ${csrData[0].lastName} Has Added New Property`,
//      "notifyType":"Property"
// }

//     }
//     if (role === 5) {
//       console.log("csr")
//       const userData = await userModel.find({
//         email: req.body.agentDetails.userId,
//       });

//       if (req.body.enteredBy) {
//         fieldDetailsData = {
//           csrId: userId,

//           role,
//           ...req.body,
 
//           userId: userData[0]._id.toString(),
//         };
//       } else {
//         console.log("abc");
//         fieldDetailsData = {
//           csrId: userId,
//           role,
//           enteredBy: userId,
//           ...req.body,
//           userId: userData[0]._id.toString(),
 
//         };
//       }
//       const csrData = await userModel.find({ _id: req.user.user.userId });

//       message={
//         "senderId":req.user.user.userId,
//         "receiverId":req.body.agentDetails.userId,
//         "message":`${csrData[0].firstName} ${csrData[0].lastName} Has Added New Property`,
//         "notifyType":"Property"

//       }
//     }

//     if (fieldDetailsData.address.latitude === '' || fieldDetailsData.address.latitude === undefined) {
//       delete fieldDetailsData.address.latitude;
//     }
    
//     if (fieldDetailsData.address.longitude === '' || fieldDetailsData.address.longitude === undefined) {
//       delete fieldDetailsData.address.longitude;
//     }
    
//     const validatedData = await fieldValidationSchema.validateAsync(
//       fieldDetailsData,
//       { abortEarly: false }
//     );
//     console.log("after validation", validatedData);
//     const fieldDetails = new fieldModel(validatedData);
//     await fieldDetails.save();
//     console.log("success");

// const notify=new notifyModel(message)
// await notify.save()

//     res
//       .status(201)
//       .json({ message: "field details added successfully", success: true ,"landDetails":validatedData});
//   } catch (error) {
//     // Handle validation errors

//     if (error.isJoi) {
//       console.log(error);
//       return res.status(422).json({
//         message: "Validation failed",
//         details: error.details.map((err) => err.message), // Provide detailed Joi validation errors
//         success: false,
//       });
//     }

//     // Handle server errors
//     console.log(error);
//     res.status(500).json({ message: "Error inserting field details", error });
//   }
// };

const insertFieldDetail = async (req, res) => {
  try {
    const { userId, role } = req.user.user;
    req.body.amenities.electricity = String(req.body.amenities.electricity); // Ensure electricity is a string
    console.log(req)
    let fieldDetailsData;
    let message = {};

    // Fetch user data once
    const userData = await userModel.findById(userId);
    if (!userData) {
      console.log(userData,'  user data')
      return res.status(409).json({ message: "User not found" });
    }
    console.log(userData,'  user data')
    console.log(userData.assignedCsr,' csr data' )
    if (role === 1) { // CSR role
      const csrId=userData.assignedCsr;

      const csrData = await userModel.findById(csrId);
      console.log(csrData[0]);
      if (!csrData) {
        return res.status(409).json({ message: "CSR not found" });
      }

      if (req.body.enteredBy) {
        fieldDetailsData = {
          userId,
          csrId: csrData._id.toString(),
          role,
          ...req.body,
        };
      } else {
        fieldDetailsData = {
          userId,
          role,
          enteredBy: userId,
          csrId: csrData._id.toString(),
          ...req.body,
        };
      }

      message = {
        senderId: userId,
        receiverId: csrData._id.toString(),
        message: `${csrData.firstName} ${csrData.lastName} has added a new property`,
        notifyType: "Property",
      };
    }

    if (role === 5) { // Agent role
      const agentData = await userModel.findOne({ email: req.body.agentDetails.userId });
      if (!agentData) {
        return res.status(404).json({ message: "Agent not found" });
      }

      if (req.body.enteredBy) {
        fieldDetailsData = {
          csrId: userId,
          role,
          userId: agentData._id.toString(),
          ...req.body,
        };
      } else {
        fieldDetailsData = {
          csrId: userId,
          role,
          enteredBy: userId,
          userId: agentData._id.toString(),
          ...req.body,
        };
      }

      const csrData = await userModel.findById(userId);
      if (!csrData) {
        return res.status(409).json({ message: "CSR not found" });
      }

      message = {
        senderId: userId,
        receiverId: req.body.agentDetails.userId.toString(),
        message: `${csrData.firstName} ${csrData.lastName} has added a new property`,
        notifyType: "Property",
      };
    }

    // Handle address latitude and longitude if they are empty or undefined
    if (!fieldDetailsData.address.latitude) {
      delete fieldDetailsData.address.latitude;
    }

    if (!fieldDetailsData.address.longitude) {
      delete fieldDetailsData.address.longitude;
    }

    // Validate the data using Joi schema
    const validatedData = await fieldValidationSchema.validateAsync(fieldDetailsData, { abortEarly: false });
    console.log("After validation:", validatedData);

    // Save the field details to the database
    const fieldDetails = new fieldModel(validatedData);
    await fieldDetails.save();
    console.log("Field details added successfully");

    // Create and save the notification
    
    const notification = new notifyModel(message);
    await notification.save();

    // Respond to the client
    res.status(201).json({
      message: "Field details added successfully",
      success: true,
      landDetails: validatedData,
    });
  } catch (error) {
    // Handle validation errors
    if (error.isJoi) {
      console.log(error);
      return res.status(422).json({
        message: "Validation failed",
        details: error.details.map((err) => err.message), // Provide detailed Joi validation errors
        success: false,
      });
    }

    // Handle server errors
    console.log(error);
    res.status(500).json({ message: "Error inserting field details", error });
  }
};
const mongoose = require("mongoose");


/**
 * Utility function to generate a unique property ID for agricultural land.
 * Prefix: "PA"
 */
const generatePropertyId = async (typePrefix, model) => {
  const lastEntry = await model.findOne().sort({ _id: -1 }).select('propertyId');
  let lastId = 0;
  if (lastEntry && lastEntry.propertyId) {
    lastId = parseInt(lastEntry.propertyId.slice(2), 10); // Extract numeric part after "PA"
  }
  return `${typePrefix}${lastId + 1}`;
};

// const translate = require('@iamtraction/google-translate'); // Import translation library

const insertFieldDetailsTransla = async (req, res) => {
  try {
    const { userId, role } = req.user.user;
    req.body.amenities.electricity = String(req.body.amenities.electricity);

    const propertyId = await generatePropertyId("PA", fieldModel);
    req.body.propertyId = propertyId;

    let fieldDetailsData;
    let message = {};

    // Fetch user data
    const userData = await userModel.findById(userId);
    if (!userData) {
      return res.status(409).json({ message: "User not found" });
    }

    if (role === 1) {
      // CSR role
      const csrId = userData.assignedCsr;
      const csrData = await userModel.findById(csrId);
      if (!csrData) {
        return res.status(404).json({ message: "Assigned CSR not found" });
      }

      fieldDetailsData = {
        userId,
        csrId: csrData._id.toString(),
        role,
        ...req.body,
        enteredBy: req.body.enteredBy || userId,
      };

      message = {
        senderId: userId,
        receiverId: csrData._id.toString(),
        message: `${userData.firstName} ${userData.lastName} has added a new property`,
        notifyType: "Property",
      };
    } else if (role === 5) {
      // Agent role
      fieldDetailsData = {
        userId,
        role,
        ...req.body,
        enteredBy: req.body.enteredBy || userId,
      };

      message = {
        senderId: userId,
        receiverId: "Admin",
        message: `${userData.firstName} ${userData.lastName} has added a new property`,
        notifyType: "Property",
      };
    } else {
      return res.status(403).json({ message: "Unauthorized role for this action" });
    }

    // Remove translated fields (those with 'Te' suffix)
    const sanitizedData = {};
    Object.keys(fieldDetailsData).forEach((key) => {
      if (!key.endsWith("Te")) {
        sanitizedData[key] = fieldDetailsData[key];
      }
    });

    // Translate all string fields and append Telugu versions
    for (const [key, value] of Object.entries(sanitizedData)) {
      if (typeof value === "string" && /^[a-zA-Z\s]+$/.test(value)) {
        const { text: translatedValue } = await translate(value, { to: "te" });
        sanitizedData[`${key}Te`] = translatedValue;
      } else if (typeof value === "object" && !Array.isArray(value)) {
        // Recursively handle nested objects
        for (const [nestedKey, nestedValue] of Object.entries(value)) {
          if (typeof nestedValue === "string" && /^[a-zA-Z\s]+$/.test(nestedValue)) {
            const { text: translatedValue } = await translate(nestedValue, { to: "te" });
            sanitizedData[key][`${nestedKey}Te`] = translatedValue;
          }
        }
      }
    }

    // Validate and save field details
    const validatedData = await fieldValidationSchema.validateAsync(sanitizedData, { abortEarly: false });
    const fieldDetails = new fieldModel(validatedData);
    await fieldDetails.save();

    // Validate and save the notification object
    const notification = new notifyModel(message);
    await notification.save();

    res.status(201).json({
      message: "Field details added successfully",
      success: true,
      landDetails: validatedData,
    });
  } catch (error) {
    if (error.isJoi) {
      return res.status(422).json({
        message: "Validation failed",
        details: error.details.map((err) => err.message),
        success: false,
      });
    }
    console.error("Error inserting field details:", error);
    res.status(500).json({ message: "Error inserting field details", error });
  }
};
const insertFieldDetails = async (req, res) => {
  try {
    const { userId, role } = req.user.user;
    req.body.amenities.electricity = String(req.body.amenities.electricity);

    // Generate a unique property ID for agricultural land
    const propertyId = await generatePropertyId("PA", fieldModel);
    req.body.propertyId = propertyId;

    let fieldDetailsData;
    let message = {};

    // Fetch user data
    const userData = await userModel.findById(userId);
    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    if (role === 1) { // CSR role
      const csrId = userData.assignedCsr;
      const csrData = await userModel.findById(csrId);
      if (!csrData) {
        return res.status(404).json({ message: "Assigned CSR not found" });
      }

      fieldDetailsData = {
        userId,
        csrId: csrData._id.toString(),
        role,
        ...req.body,
        enteredBy: req.body.enteredBy || userId,
      };

      message = {
        senderId: userId,
        receiverId: csrData._id.toString(),
        message: `${userData.firstName} ${userData.lastName} has added a new property`,
        notifyType: "Property",
      };
    } else if (role === 5) { // Agent role
      fieldDetailsData = {
        userId,
        role,
        ...req.body,
        enteredBy: req.body.enteredBy || userId,
      };

      message = {
        senderId: userId,
        receiverId: "Admin", // Example for agent notifying admin
        message: `${userData.firstName} ${userData.lastName} has added a new property`,
        notifyType: "Property",
      };
    } else {
      return res.status(403).json({ message: "Unauthorized role for this action" });
    }

    // Clean up optional latitude/longitude if empty
    if (!fieldDetailsData.address.latitude) {
      delete fieldDetailsData.address.latitude;
    }
    if (!fieldDetailsData.address.longitude) {
      delete fieldDetailsData.address.longitude;
    }

    // Validate and save field details
    const validatedData = await fieldValidationSchema.validateAsync(fieldDetailsData, { abortEarly: false });
    const fieldDetails = new fieldModel(validatedData);
    await fieldDetails.save();

    // Validate and save the notification object

  let message1={
    senderId:userId,
    receiverId:0,
    message:"A new property added ! Please checkout",
    notifyType:"Customer"
  }

    console.log("Notification Object:", message);
    const notification = new notifyModel(message);
    const notification1=new notifyModel(message1);
    await notification.save(); 
    await notification1.save();

    res.status(201).json({
      message: "Field details added successfully",
      success: true,
      landDetails: validatedData,
    });
  } catch (error) {
    if (error.isJoi) {
      return res.status(422).json({
        message: "Validation failed",
        details: error.details.map((err) => err.message),
        success: false,
      });
    }
    console.error("Error inserting field details:", error);
    res.status(500).json({ message: "Error inserting field details", error });
  }
};

/**
 * Helper function to generate unique property IDs.
 */
// const generatePropertyId = async (typePrefix, model) => {
//   const lastEntry = await model.findOne().sort({ _id: -1 }).select("propertyId");
//   let lastId = 0;
//   if (lastEntry && lastEntry.propertyId) {
//     lastId = parseInt(lastEntry.propertyId.slice(2), 10); // Extract numeric part after the prefix
//   }
//   return `${typePrefix}${lastId + 1}`;
// };


const getAllFields = async (req, res) => {
  try {
    const userId = req.user.user.userId;
    const role = req.user.user.role;
    // Fetch all fields
    let fields;
    if (role === 3) {
      fields = await fieldModel.find({ status: 0 }).sort({ updatedAt: -1 });
    } else {
      fields = await fieldModel.find().sort({ status: 1, updatedAt: -1 });
    }
    if (fields.length === 0) {
      return res.status(200).json({ data: [] });
    }

    // Extract property IDs
    const propertyIds = fields.map((field) => field._id.toString());

    // Fetch wishlist statuses for all property IDs
    const statuses = await wishlistModel
      .find({ userId: userId, propertyId: { $in: propertyIds } })
      .select("propertyId status");
    const ratingstatuses = await propertyRatingModel
      .find({ userId: userId, propertyId: { $in: propertyIds } })
      .select("propertyId status");
    // Create a map for quick status lookup
    const statusMap = statuses.reduce((map, item) => {
      map[item.propertyId.toString()] = item.status;
      return map;
    }, {});

    const ratingstatusMap = ratingstatuses.reduce((map, item) => {
      map[item.propertyId.toString()] = item.status;
      return map;
    }, {});
    // Add wishStatus to each field item
    const updatedFields = fields.map((field) => {
      const fieldObj = field.toObject(); // Convert Mongoose document to plain object
      fieldObj.wishStatus = statusMap[field._id.toString()] || 0; // Default to 0 if not found
      fieldObj.ratingStatus = ratingstatusMap[field._id.toString()] || 0; // Default to 0 if not found
      return fieldObj;
    });

    res.status(200).json({ data: updatedFields, count: updatedFields.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching fields", error });
  }
};

//get fields by district
const getByDistrict = async (req, res) => {
  try {
    const properties = await fieldModel
      .find(
        {},
        {
          "landDetails.images": 1,
          "address.district": 1,
          "landDetails.title": 1,
          "landDetails.size": 1,
          "landDetails.totalPrice": 1,
        }
      )
      .exec();
    if (properties.length === 0) {
      return res.status(200).json([]);
    }
    res.status(200).send(properties);
  } catch (error) {
    res.status(500).json({ message: "Error fetching fields", error });
  }
};

const editFieldDetails = async (req, res) => {
  try {
   
    let propertyId=req.body.propertyId
    let data={...req.body}
      const updateFileds = await fieldModel.findByIdAndUpdate(propertyId, data , {
      new: true, 
      runValidators: true,
    });
    
    res.status(200).json("Updated Successfully");
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
};

module.exports = {
  getFields,
  insertFieldDetails,
  getAllFields,
  getByDistrict,
  editFieldDetails
};
