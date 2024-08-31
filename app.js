var createError = require('http-errors');
var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var connectDB = require("./config/db");

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');
var followRouter = require('./routes/follow');

var app = express();

// Kết nối cơ sở dữ liệu
connectDB();

// Sử dụng middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Định tuyến cho API
app.use('/api/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/follow', followRouter);

// Xử lý lỗi 404 và chuyển tiếp đến trình xử lý lỗi
app.use(function (req, res, next) {
  next(createError(404));
});

// Trình xử lý lỗi
app.use(function (err, req, res, next) {
  // Trả về thông báo lỗi dưới dạng JSON
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: req.app.get('env') === 'development' ? err : {}
  });
});

module.exports = app;
