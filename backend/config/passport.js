// const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const User = require('../models/User');

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback'
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         const email = profile.emails?.[0]?.value?.toLowerCase();

//         if (!email) {
//           return done(null, false, { message: 'No email returned from Google.' });
//         }

//         // HR-ONLY RULE: Only accounts pre-created by HR can sign in with Google.
//         const user = await User.findOne({ email });

//         if (!user) {
//           return done(null, false, {
//             message: 'Account not found. Only HR-provisioned employee accounts can sign in with Google.'
//           });
//         }

//         // Link Google ID to existing HR-created account (first time only)
//         if (!user.googleId) {
//           user.googleId = profile.id;
//           await user.save();
//         }

//         return done(null, user);
//       } catch (err) {
//         return done(err, null);
//       }
//     }
//   )
// );

// // Minimal serialize/deserialize (we use JWTs, not session-based auth)
// passport.serializeUser((user, done) => done(null, user._id));
// passport.deserializeUser(async (id, done) => {
//   try {
//     const user = await User.findById(id).select('-password');
//     done(null, user);
//   } catch (err) {
//     done(err, null);
//   }
// });

// module.exports = passport;



const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        'http://localhost:5000/api/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value?.toLowerCase();

        if (!email) {
          return done(null, false, {
            message: 'No email returned from Google.'
          });
        }

        // HR-ONLY RULE:
        // Only accounts pre-created by HR can sign in with Google.
        const user = await User.findOne({email});

        if (!user) {
          return done(null, false, {
            message:
              'Account not found. Only HR-provisioned employee accounts can sign in with Google.'
          });
        }

        // Link Google ID to existing HR-created account
        if (!user.googleId) {
          user.googleId = profile.id;
          await user.save();
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// Minimal serialize/deserialize
// We use JWTs, not session-based authentication.
passport.serializeUser((user, done) => done(null, user._id));

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select('-password');
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;