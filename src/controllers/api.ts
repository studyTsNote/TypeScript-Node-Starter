"use strict";

import graph from "fbgraph";
import { Response, Request, NextFunction } from "express";
import { UserDocument, AuthToken } from "../models/User";
import { GraphQLClient } from "graphql-request";

const GITHUB_API = process.env.GITHUB_API;


/**
 * GET /api
 * API 示例列表
 */
export const getApi = (req: Request, res: Response) => {
    res.render("api/index", {
        title: "API Examples"
    });
};

/**
 * GET /api/facebook
 * Facebook API 示例
 */
export const getFacebook = (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as UserDocument;
    const token = user.tokens.find((token: AuthToken) => token.kind === "facebook");
    graph.setAccessToken(token.accessToken);
    graph.get(`${user.facebook}?fields=id,name,email,first_name,last_name,gender,link,locale,timezone`, (err: Error, results: graph.FacebookUser) => {
        if (err) { 
            return next(err); 
        }
        res.render("api/facebook", {
            title: "Facebook API",
            profile: results
        });
    });
};


/**
 * GET /api/github
 * GitHub API 示例
 */
export const getGitHub = (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as UserDocument;
    const token = user.tokens.find((token: AuthToken) => token.kind === "github");

    const graphQLClient = new GraphQLClient(GITHUB_API, {
        headers: {
            authorization: `bearer ${token.accessToken}`
        }
    });

    // 查询用户基本信息
    const query = `{
        viewer {
            name,
            avatarUrl,
            bio,
            websiteUrl,
            location
        }
    }`;
    graphQLClient.request(query)
        .then(data => {
            res.render("api/github", {
                title: "GitHub API",
                email: user.email,
                profile: data.viewer
            });
        })
        .catch(err => {
            if (err) {
                next(err);
            }
        });
};
