// import { asyncHandler } from "../utils/asyncHandler.js";
// import { ApiError } from "../utils/ApiError.js";
// import { User } from "../models/user.model.js";
// import { uploadOnCloudinary } from "../utils/cloudinary.js";
// import { ApiResponse } from "../utils/ApiResponse.js";

// const registerUser = asyncHandler(async (req, res) => {
//   // get user details from frontend
//   // validation - not empty
//   // check if user already exist: username, email
//   // check for images, check for avatar
//   // upload item to cloudinary, avatar
//   // create user object - create entry in db
//   // remove password and refresh token field from response
//   // check for user creation
//   // return res

//   const { fullname, email, username, password } = req.body;
//   console.log("email: ", email);

//   // if (fullname === "") {
//   //   throw new ApiError(400, "fullname is required")
//   // }

//   if (
//     [fullname, email, username, password].some((field) => field?.trim() === "")
//   ) {
//     throw new ApiError(400, "All fields are required");
//   }

//   const existedUser = await User.findOne({
//     $or: [{ username }, { email }],
//   });

//   if (existedUser) {
//     throw new ApiError(409, `User with ${email} or ${username} already exist`);
//   }

//   const avatarLocalPath = req.files?.avatar?.[0]?.path;

//   console.log("Resolved avatar path:", avatarLocalPath);
//   // console.log("Content-Type:", req.headers["content-type"]);
//   // console.log("Request body:", req.body);
//   // console.log("Request files:", req.files);
//   // console.log("Avatar files:", req.files?.avatar);
//   // const coverImageLocalPath = req.files?.coverImage[0]?.path;

//   let coverImageLocalPath;
//   if (
//     req.files &&
//     Array.isArray(req.files.coverImage) &&
//     req.files.coverImage.length > 0
//   ) {
//     coverImageLocalPath = req.files.coverImage[0].path;
//   }

//   if (!avatarLocalPath) {
//     throw new ApiError(400, "Avatar file is required");
//   }

//   const avatar = await uploadOnCloudinary(avatarLocalPath);
//   const coverImage = await uploadOnCloudinary(coverImageLocalPath);

//   if (!avatar) {
//     throw new ApiError(400, "Avatar file is required");
//   }

//   const user = await User.create({
//     fullname,
//     avatar: avatar.url,
//     coverImage: coverImage?.url || "",
//     email,
//     password,
//     username: username.toLowerCase(),
//   });

//   const createdUser = await User.findById(user._id).select(
//     "-password -refreshToken"
//   );

//   if (!createdUser) {
//     throw new ApiError(500, "Something went wrong while registering the user");
//   }

//   return res
//     .status(201)
//     .json(new ApiResponse(200, createdUser, "User registered successfully"));
// });

// export { registerUser };

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  // 1. Get user details
  const { fullname, email, username, password } = req.body;

  // 2. Validate required fields
  if (
    [fullname, email, username, password].some(
      (field) => typeof field !== "string" || field.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // 3. Check if user already exists
  const existedUser = await User.findOne({
    $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }],
  });

  if (existedUser) {
    throw new ApiError(
      409,
      `User with email ${email} or username ${username} already exists`
    );
  }

  // 4. Get uploaded file paths from Multer

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  console.log("Avatar response received:", Boolean(avatar));
  console.log("Avatar URL:", avatar?.secure_url);

  if (!avatar?.secure_url) {
    throw new ApiError(500, "Avatar upload failed. Check server logs.");
  }

  let coverImageUrl = "";

  if (coverImageLocalPath) {
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!coverImage?.secure_url) {
      throw new ApiError(500, "Cover image upload failed");
    }

    coverImageUrl = coverImage.secure_url;
  }

  const user = await User.create({
    fullname: fullname.trim(),
    email: email.trim().toLowerCase(),
    username: username.trim().toLowerCase(),
    password,
    avatar: avatar.secure_url,
    coverImage: coverImageUrl,
  });

  // 9. Exclude sensitive fields from response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  // 10. Send success response
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

export { registerUser };
