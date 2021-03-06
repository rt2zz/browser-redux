import fs from 'fs';
import gulp from 'gulp';
import gutil from 'gulp-util';
import jade from 'gulp-jade';
import rename from 'gulp-rename';
import zip from 'gulp-zip';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import devConfig from './webpack/dev.config';
import prodConfig from './webpack/prod.config';
import appConfig from './webpack/app.config';

const port = 3000;

/*
 * common tasks
 */
gulp.task('replace-webpack-code', () => {
  const replaceTasks = [ {
    from: './webpack/replace/JsonpMainTemplate.runtime.js',
    to: './node_modules/webpack/lib/JsonpMainTemplate.runtime.js'
  }, {
    from: './webpack/replace/log-apply-result.js',
    to: './node_modules/webpack/hot/log-apply-result.js'
  } ];
  replaceTasks.forEach(task => fs.writeFileSync(task.to, fs.readFileSync(task.from)));
});

/*
 * dev tasks
 */

gulp.task('webpack-dev-server', () => {
  let myConfig = Object.create(devConfig);
  new WebpackDevServer(webpack(myConfig), {
    contentBase: `http://localhost:${port}`,
    publicPath: myConfig.output.publicPath,
    stats: {colors: true},
    hot: true,
    historyApiFallback: true
  }).listen(port, 'localhost', (err) => {
    if (err) {
      throw new gutil.PluginError('webpack-dev-server', err);
    }
    gutil.log('[webpack-dev-server]', `listening at port ${port}`);
  });
});

gulp.task('views:dev', () => {
  gulp.src('./src/browser/views/*.jade')
    .pipe(jade({
      locals: { env: 'dev' }
    }))
    .pipe(gulp.dest('./dev'));
});

gulp.task('copy:dev', () => {
  gulp.src('./src/browser/extension/manifest.dev.json')
    .pipe(rename('manifest.json'))
    .pipe(gulp.dest('./dev'));
  gulp.src('./src/assets/**/*').pipe(gulp.dest('./dev'));
});

/*
 * build tasks
 */

gulp.task('webpack:build:extension', (callback) => {
  let myConfig = Object.create(prodConfig);
  webpack(myConfig, (err, stats) => {
    if (err) {
      throw new gutil.PluginError('webpack:build', err);
    }
    gutil.log('[webpack:build]', stats.toString({ colors: true }));
    callback();
  });
});

gulp.task('webpack:build:app', (callback) => {
  let myConfig = Object.create(appConfig);
  webpack(myConfig, (err, stats) => {
    if (err) {
      throw new gutil.PluginError('webpack:build', err);
    }
    gutil.log('[webpack:build]', stats.toString({ colors: true }));
    callback();
  });
});

gulp.task('views:build:extension', () => {
  gulp.src([
      './src/browser/views/*.jade',
      '!./src/browser/views/devtools.jade'
    ])
    .pipe(jade({
      locals: { env: 'prod' }
    }))
    .pipe(gulp.dest('./build/extension'));
});

gulp.task('views:build:app', () => {
  gulp.src([
    './src/browser/views/*.jade',
    '!./src/browser/views/devtools.jade'
  ])
    .pipe(jade({
      locals: { env: 'prod' }
    }))
    .pipe(gulp.dest('./build/app'));
});

gulp.task('copy:build:extension', () => {
  gulp.src('./src/browser/extension/manifest.prod.json')
    .pipe(rename('manifest.json'))
    .pipe(gulp.dest('./build/extension'));
  gulp.src('./src/assets/**/*').pipe(gulp.dest('./build/extension'));
});

gulp.task('copy:build:app', () => {
  gulp.src('./src/browser/chromeApp/manifest.json')
    .pipe(rename('manifest.json'))
    .pipe(gulp.dest('./build/app'));
  gulp.src('./src/assets/**/*').pipe(gulp.dest('./build/app'));
});

/*
 * compress task
 */

gulp.task('zip:extension', () => {
  gulp.src('build/extension/*')
    .pipe(zip('extension.zip'))
    .pipe(gulp.dest('./build'));
});

gulp.task('zip:app', () => {
  gulp.src('build/app/*')
    .pipe(zip('app.zip'))
    .pipe(gulp.dest('./build'));
});

gulp.task('default', ['replace-webpack-code', 'webpack-dev-server', 'views:dev', 'copy:dev']);
gulp.task('build:extension', ['replace-webpack-code', 'webpack:build:extension', 'views:build:extension', 'copy:build:extension']);
gulp.task('build:app', ['replace-webpack-code', 'webpack:build:app', 'views:build:app', 'copy:build:app']);
gulp.task('compress:extension', ['zip:extension']);
gulp.task('compress:app', ['zip:app']);
