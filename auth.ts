import type { NextAuthConfig } from "next-auth";
import NextAuth from "next-auth";
import CredentialsProvider from 'next-auth/providers/credentials';

const credentialsConfig = CredentialsProvider({
    name: "Credentials",
    credentials: {
        username: {label: 'Username', type: 'text'},
        password: {label: 'Password', type: 'password'}
    },
    async authorize(credentials) {
        console.log('credentials==',credentials)
        if(credentials.username==="war"&&credentials.password==='123')
            return {
        name: 'something longer name'}
        return null
    },
})

const config = {
    providers: [credentialsConfig],
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: 'jwt',
        maxAge: 60*60*24
    },
    callbacks: {
        authorized({
            request, auth
        }){
            const {pathname} = request.nextUrl;
            if(pathname === "/dashboard") return !!auth;
            return true;
        }
    }

} satisfies NextAuthConfig

export const {handlers, auth, signIn, signOut} = NextAuth(config)