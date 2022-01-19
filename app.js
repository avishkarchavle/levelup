if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require("express");
const app = express()
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const path = require("path");
const methodOverride = require('method-override')
const Student = require('./models/student.js')
const Teacher = require('./models/teacher.js')
const User = require('./models/user.js');
const catchAsync = require('./utils/catchAsync');
const expressError = require('./utils/expressError');
const session = require('express-session');
const passport = require('passport');
const localStrategy = require("passport-local")
const flash = require('connect-flash');
const { validateTeacher, validateStudent, isLoggedIn, isOwner, isTeacher } = require('./middleware')
const mongoSanitize = require('express-mongo-sanitize');

const MongoStore = require('connect-mongo');


app.use(express.urlencoded({ extended: true }))
app.use(methodOverride("_method"))
app.use(express.static(path.join(__dirname, 'public')))


// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());

app.engine('ejs', ejsMate)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/levelUp';

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connnection error:"));
db.once("open", () => {
    console.log("Databse connected");
});

app.use(
    mongoSanitize({
        replaceWith: '_',
    }),
);

const secret = process.env.SECRET || "thisshouldbeabettersecret";
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret
    },
    touchAfter: 24 * 60 * 60
})
store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})

const sessionconfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure:true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};

app.use(session(sessionconfig))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error');
    next();
})


app.get('/home', (req, res) => {
    res.render("home");
    req.logout();
})


app.get('/about', (req, res) => {
    res.render("about");
})

//students route
app.get('/students/register', (req, res) => {
    res.render('students/register')
})

app.post('/students/register', catchAsync(async (req, res) => {
    try {
        const { username, password, email } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Now fill the information');
            res.redirect('/students/new');
        })

    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/students/register');
    }
}))

app.get('/students/new', isLoggedIn, (req, res) => {
    res.render('students/new');
})

app.get('/students/:id/newhome', isLoggedIn, isOwner, async (req, res) => {
    const { id } = req.params;
    const student = await Student.findById(id);
    const teachers = {}
    res.render('students/newhome', { student, teachers });
})

app.post('/students', validateStudent, isLoggedIn, catchAsync(async (req, res) => {
    const student = new Student(req.body.student);
    student.author = req.user._id;

    await student.save();
    req.flash('success', "Student Successfully Registered!!!");
    res.redirect(`/students/${student._id}/newhome`);

}))

app.get('/students/:id/edit', isLoggedIn, isOwner, catchAsync(async (req, res) => {
    const { id } = req.params;
    const student = await Student.findById(id);
    res.render('students/edit', { student })
}))

app.patch('/students/:id', isLoggedIn, isOwner, catchAsync(async (req, res) => {
    const { id } = req.params;
    const student = await Student.findByIdAndUpdate(id, { ...req.body.student });
    // console.log(student);
    req.flash('success', "Edited information successfully!");
    res.redirect(`/students/${student._id}/edit`);
}))

app.get('/students/:id/books', isLoggedIn, isOwner, (req, res) => {
    res.render("books");
})

app.get('/students/:id/logout', isLoggedIn, isOwner, async (req, res) => {
    req.logout();
    req.flash('success', "Goodbye!");
    res.redirect('/home');
})

app.get('/students/:id/pyq', isLoggedIn, isOwner, (req, res) => {
    res.render("pyq");
})

app.get('/students/:id/tutions', isLoggedIn, isOwner, (req, res) => {
    res.render("tutions");
})

app.get('/students/:id/askq', isLoggedIn, isOwner, (req, res) => {
    res.render("askq");
})

app.post('/students/:id/search', isLoggedIn, isOwner, catchAsync(async (req, res) => {
    const { id } = req.params;
    const student = await Student.findById(id);
    const district = req.body.search.toLowerCase();

    const teachers = await Teacher.find({ "district": district })
    if (teachers) {
        res.render('students/searchteacher', { student, teachers })
    }

}))

//login
app.get('/already', (req, res) => {
    res.render("already");
})

app.post('/already', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), catchAsync(async (req, res) => {
    const user = await User.findById(req.user._id);
    // console.log(user);
    const student = await Student.find({ author: user._id });
    const teacher = await Teacher.find({ author: user._id });
    if (student.length) {
        res.redirect(`/students/${student[0]._id}/edit`);
    } else if (teacher.length) {
        res.redirect(`/teachers/${teacher[0]._id}/edit`);
    }
}))



//teacher route
app.get('/teachers/register', (req, res) => {
    res.render('teachers/register')
})

app.post('/teachers/register', catchAsync(async (req, res) => {
    try {
        const { username, password, email } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Now fill the information');
            res.redirect('/teachers/new');
        })

    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/teachers/register');
    }
}))

app.get('/teachers/new', isLoggedIn, (req, res) => {
    res.render("teachers/new");
})

app.get('/teachers/:id/main', isLoggedIn, isTeacher, async (req, res) => {
    const { id } = req.params;
    const teacher = await Teacher.findById(id);
    const students = {}
    res.render('teachers/main', { teacher, students });
})

app.post('/teachers', validateTeacher, isLoggedIn, catchAsync(async (req, res) => {
    const teacher = new Teacher(req.body.teacher);
    teacher.author = req.user._id;
    await teacher.save();
    req.flash('success', "Teacher Successfully Registered!!!");
    res.redirect(`/teachers/${teacher._id}/main`);

}))

app.get('/teachers/:id/edit', isLoggedIn, isTeacher, catchAsync(async (req, res) => {
    const { id } = req.params;
    const teacher = await Teacher.findById(id);
    res.render('teachers/edit', { teacher })
}))

app.patch('/teachers/:id', isLoggedIn, isTeacher, catchAsync(async (req, res) => {
    const { id } = req.params;
    const teacher = await Teacher.findByIdAndUpdate(id, { ...req.body.teacher });
    req.flash('success', "Edited information successfully!");
    res.redirect(`/teachers/${teacher._id}/edit`);
}))

app.get('/teachers/:id/logout', isLoggedIn, isTeacher, async (req, res) => {
    req.logout();
    req.flash('success', "Goodbye!");
    res.redirect('/home');
})

app.get('/teachers/:id/books', isLoggedIn, isTeacher, (req, res) => {
    res.render("books");
})

app.get('/teachers/:id/pyq', isLoggedIn, isTeacher, (req, res) => {
    res.render("pyq");
})

app.get('/teachers/:id/askq', isLoggedIn, isTeacher, (req, res) => {
    res.render("askq");
})

app.post('/teachers/:id/search', isLoggedIn, isTeacher, catchAsync(async (req, res) => {
    const { id } = req.params;
    const teacher = await Teacher.findById(id);
    const district = req.body.search.toLowerCase();
    const students = await Student.find({ "district": district })
    if (students) {
        res.render('teachers/searchstudent', { teacher, students })
    }
}))


//main page for studwent and teacher login
app.get('/login', (req, res) => {
    res.render("login");
})

app.all('*', (req, res, next) => {
    next(new expressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message)
        err.message = "Oh No, Something went wrong!"
    res.status(statusCode).render('error', { err })
})

app.listen(3000, () => {
    console.log('listening on port 3000');
})