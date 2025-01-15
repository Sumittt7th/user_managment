import * as userService from "./user.service";
import { createResponse } from "../common/helper/response.hepler";
import asyncHandler from "express-async-handler";
import { type Request, type Response } from "express";
import passport from "passport";
import { createUserTokens } from "../common/services/passport-jwt.service";
import jwt from "jsonwebtoken";
import { sendEmail } from "../common/services/email.service";
import bcrypt from "bcrypt";

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const result = await userService.createUser(req.body);
  res.send(createResponse(result, "User created sucssefully"));
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const result = await userService.updateUser(req.params.id, req.body);
  res.send(createResponse(result, "User updated sucssefully"));
});

export const editUser = asyncHandler(async (req: Request, res: Response) => {
  const result = await userService.editUser(req.params.id, req.body);
  res.send(createResponse(result, "User updated sucssefully"));
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const result = await userService.deleteUser(req.params.id);
  res.send(createResponse(result, "User deleted sucssefully"));
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const result = await userService.getUserById(req.params.id);
  res.send(createResponse(result));
});

export const getAllUser = asyncHandler(async (req: Request, res: Response) => {
  const result = await userService.getAllUser();
  res.send(createResponse(result));
});

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  passport.authenticate(
    "login",
    async (err: Error | null, user: any | undefined, info: any) => {
      if (err || !user) {
        return res.status(401).json({
          message: info?.message || "Authentication failed",
        });
      }

      const { accessToken, refreshToken } = createUserTokens(user);
      await userService.updateUser(user._id, { refToken: refreshToken });

      res.send(
        createResponse({ accessToken, refreshToken, user }, "Login successful")
      );
    }
  )(req, res);
});

export const createUserByAdmin = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, name } = req.body;

    // Save user to the database (inactive by default, with token)
    const newUser = await userService.createUser({
      name,
      email,
    });

    // Generate a verification token
    const jwtSecret = process.env.JWT_SECRET ?? "";
    const verifyToken = jwt.sign({ id: newUser._id.toString() }, jwtSecret, {
      expiresIn: "1h",
    });
    console.log(verifyToken);
    await userService.updateUser(newUser._id, {
      verificationToken: verifyToken,
    });

    // Send verification email
    const verificationLink = `${process.env.FE_BASE_URL}/verify?token=${verifyToken}`;
    const mailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject: "Verify Your Account",
      html: `
      <html>
        <body>
          <p>Welcome ${name},</p>
          <p>Click <a href=${verificationLink}>here</a> to verify your account.</p>
        </body>
      </html>
    `,
    };

    await sendEmail(mailOptions);

    res.send(
      createResponse(
        newUser,
        "User created successfully. Verification email sent."
      )
    );
  }
);

export const setPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body;

  // Find user by verification token
  const user = await userService.getUserByVerificationToken(token);

  if (!user) {
    res.send(createResponse(null, "Invalid or expired token"));
    return;
  }

  // Hash password and update user
  const hashedPassword = await bcrypt.hash(password, 12);
  await userService.updateUser(user._id, {
    password: hashedPassword,
    verificationToken: "",
    active:true,
  });

  res.send(
    createResponse(null, "Password set successfully. You can now log in.")
  );
});


export const setProfile = asyncHandler(async (req: Request, res: Response) => {
  const { age, phone, qualification } = req.body;
  if (req?.user?._id) {
    const result = await userService.updateUser(req?.user?._id,{
      age:age,
      phone:phone,
      qualification:qualification,
    });
    res.send(createResponse(result, "Profile Updated Sucessfully"));
  } else {
    res.send(createResponse(null, "Profile not updated successfully"));
  }
});

export const setKyc = asyncHandler(async (req: Request, res: Response) => {
  const image = req.file ? req.file.buffer.toString("base64") : "";
  console.log(image);
  if (req?.user?._id) {
    const result = await userService.updateUser(req?.user?._id, {
      kycDocument:image,
    });
    res.send(createResponse(result, "User All Tasks fetched successfully"));
  } else {
    res.send(createResponse(null, "User All Tasks not fetched successfully"));
  }
});

export const activeUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await userService.updateUser(id,{
    active:false
  });
  res.send(createResponse(result, "User activated successfully"));
});

export const enableTwoFactorAuth = asyncHandler(async (req: Request, res: Response) => {
  if (req?.user?._id) {
    const result = await userService.updateUser(req?.user?._id, {
      TwoFA:false
    });
    res.send(createResponse(result, "2FA diabel Sucessfully"));
  } else {
    res.send(createResponse(null, "2FA not diasble successfully"));
  }
});




