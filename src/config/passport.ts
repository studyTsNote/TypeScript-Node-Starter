import passport from "passport";
import passportLocal from "passport-local";
import passportFacebook from "passport-facebook";
import passportGitHub from "passport-github";
import _ from "lodash";

import { User, UserDocument, GitHubProfile } from "../models/User";
import { Request, Response, NextFunction } from "express";

const LocalStrategy = passportLocal.Strategy;
const FacebookStrategy = passportFacebook.Strategy;
const GitHubStrategy = passportGitHub.Strategy;

passport.serializeUser((user, done) => {
    done(undefined, (user as UserDocument).id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});


/**
 * 使用邮箱和密码登录
 */
passport.use(new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
    User.findOne({ email: email.toLowerCase() }, (err, user: UserDocument) => {
        if (err) { 
            return done(err); 
        }
        if (!user) {
            return done(undefined, false, { message: `没有此邮箱 ${email}` });
        }
        user.comparePassword(password, (err: Error, isMatch: boolean) => {
            if (err) {
                console.log(err);
            }
            if (isMatch) {
                return done(undefined, user);
            }
            return done(undefined, false, { message: "邮箱或密码错误！"});
        });
    });
}));


 /**
  * OAuth 授权流程概述
  * 
  * - 用户已经登录
  *     - 检查是否存在带有提供者 ID 的账户
  *         - 如果有了，返回错误信息（不支持合并账户）
  *         - 否则，关联新的 OAuth 账户到当前登录用户
  * - 用户未登录
  *     - 检查是否老用户
  *         - 如果是，直接登录
  *         - 否则，检查是否已存在该用户邮箱的账户
  *             - 如果有了，返回一个错误信息
  *             - 创建一个新的账户 
  */

/**
 * 使用 Facebook 账号登录
 */
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_ID,
    clientSecret: process.env.FACEBOOK_SECRET,
    callbackURL: "/auth/facebook/callback",
    profileFields: ["name", "email", "link", "locale", "timezone"],
    passReqToCallback: true
}, (req: Request, accessToken, refreshToken, profile, done) => {
    if (req.user) {
        User.findOne({ facebook: profile.id }, (err, existingUser) => {
            if (err) { 
                return done(err); 
            }
            if (existingUser) {
                req.flash("errors", { msg: "已经有一个属于您的 Facebook 帐户。使用该帐户登录或删除它，然后将其与您当前的帐户关联" });
                done(err);
            } else {
                User.findById((req.user as UserDocument).id, (err, user: UserDocument) => {
                    if (err) { 
                        return done(err); 
                    }
                    user.facebook = profile.id;
                    user.tokens.push({ kind: "facebook", accessToken });
                    user.profile.name = user.profile.name || `${profile.name.givenName} ${profile.name.familyName}`;
                    user.profile.gender = user.profile.gender || profile._json.gender;
                    user.profile.picture = user.profile.picture || `https://graph.facebook.com/${profile.id}/picture?type=large`;
                    user.save((err: Error) => {
                        req.flash("info", { msg: "成功绑定 Facebook 账号" });
                        done(err, user);
                    });
                });
            }
        });
    } else {
        User.findOne({ facebook: profile.id }, (err, existingUser) => {
            if (err) { return done(err); }
            if (existingUser) {
                return done(undefined, existingUser);
            }
            User.findOne({ email: profile._json.email }, (err, existingEmailUser) => {
                if (err) { return done(err); }
                if (existingEmailUser) {
                    req.flash("errors", { msg: "已经有一个使用此邮箱的帐户。登录该帐户，然后从“帐户设置”中将其手动链接到 Facebook" });
                    done(err);
                } else {
                    const user: UserDocument = new User();
                    user.email = profile._json.email;
                    user.facebook = profile.id;
                    user.tokens.push({ kind: "facebook", accessToken });
                    user.profile.name = `${profile.name.givenName} ${profile.name.familyName}`;
                    user.profile.gender = profile._json.gender;
                    user.profile.picture = `https://graph.facebook.com/${profile.id}/picture?type=large`;
                    user.profile.location = (profile._json.location) ? profile._json.location.name : "";
                    user.save((err: Error) => {
                        done(err, user);
                    });
                }
            });
        });
    }
}));

/**
 * 使用 GitHub 账号登录
 */
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_ID,
    clientSecret: process.env.GITHUB_SECRET,
    callbackURL: "/auth/github/callback",
    passReqToCallback: true
}, (req: Request, accessToken, refreshToken, profile, done) => {
    
    const githubProfile = _.pick(profile._json, [
        "id","name","email", "location","blog","avatar_url","bio"
    ]) as GitHubProfile;

    if (req.user) {
        User.findOne({ github: githubProfile.id }, (err, existingUser) => {
            if (err) { 
                return done(err); 
            }
            if (existingUser) {
                req.flash("errors", { msg: "已经有一个属于您的 GitHub 帐户。使用该帐户登录或删除它，然后将其与您当前的帐户关联" });
                done(err);
            } else {
                User.findById((req.user as UserDocument).id, (err, user: UserDocument) => {
                    if (err) { 
                        return done(err);
                    }
                    user.github = githubProfile.id;
                    user.tokens.push({ kind: "github", accessToken });
                    user.profile.name = user.profile.name || githubProfile.name;
                    user.profile.website = user.profile.website || githubProfile.blog;
                    user.profile.picture = user.profile.picture || githubProfile.avatar_url;
                    user.profile.bio = githubProfile.bio;
                    user.save((err: Error) => {
                        req.flash("info", { msg: "成功绑定 GitHub 账号" });
                        done(err, user);
                    });
                });
            }
        });
    } else {
        User.findOne({ github: githubProfile.id }, (err, existingUser) => {
            if (err) { 
                return done(err); 
            }
            if (existingUser) {
                return done(undefined, existingUser);
            }
            User.findOne({ email: githubProfile.email }, (err, existingEmailUser) => {
                if (err) { 
                    return done(err); 
                }
                if (existingEmailUser) {
                    req.flash("errors", { msg: "已经有一个使用此邮箱的帐户。登录该帐户，然后从“帐户设置”中将其手动链接到 GitHub" });
                    done(err);
                } else {
                    const user: UserDocument = new User();
                    user.email = githubProfile.email;
                    user.github = githubProfile.id;
                    user.tokens.push({ kind: "github", accessToken });
                    user.profile.name = githubProfile.name;
                    user.profile.website = githubProfile.blog;
                    user.profile.picture = githubProfile.avatar_url;
                    user.profile.location = githubProfile.location || "";
                    user.profile.bio = githubProfile.bio || "";
                    user.save((err: Error) => {
                        done(err, user);
                    });
                }
            });
        });
    }
  }
));

/**
 * 中间件：检查是否已登录
 */
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
};

/**
 * 中间件：检查是否已有第三方账号授权
 */
export const isAuthorized = (req: Request, res: Response, next: NextFunction) => {
    const provider = req.path.split("/").slice(-1)[0];

    const user = req.user as UserDocument;
    if (_.find(user.tokens, { kind: provider })) {
        next();
    } else {
        res.redirect(`/auth/${provider}`);
    }
};
