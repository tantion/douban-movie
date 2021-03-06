/*global module:false*/
/*jshint indent:2*/
module.exports = function(grunt) {
  "use strict";

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>;' +
      ' Licensed <%= pkg.license %> */\n',
    // Task configuration.
    concat: {
      options: {
        banner: '<%= banner %>',
        separator: '\n',
        stripBanners: true
      },
      js: {
        src: [
          'src/seajs/sea-debug.js',
          'src/lib/*.js',
          'src/lib/douban/dialog.js',
          'src/lib/tipsy/jquery.tipsy.js',
          'src/lib/alertify/alertify.js',
          'src/alias.js',
          'src/private/*.js',
          'src/js/*.js',
          'src/app.js'
        ],
        dest: 'src/bootstrap.js'
      },
      privatejs: {
        src: [
          'src/seajs/sea-debug.js',
          'src/lib/*.js',
          'src/lib/alertify/alertify.js',
          'src/bootstrap/js/bootstrap.js',
          'src/js/bt-tiantang.js',
          'src/private/*.js',
          'src/alias.js',
          'src/private/main.js',
          'src/private-app.js'
        ],
        dest: 'src/private.js'
      },
      css: {
        src: [
          'src/css/*.css',
          '!src/css/private.css',
          'src/lib/tipsy/tipsy.css',
          'src/lib/alertify/themes/alertify.core.css',
          'src/lib/alertify/themes/alertify.default.css',
          'src/lib/douban/dialog.css'
        ],
        dest: 'src/bootstrap.css'
      },
      privatecss: {
        src: [
          'src/lib/magnific-popup.css',
          'src/lib/alertify/themes/alertify.core.css',
          'src/lib/alertify/themes/alertify.default.css',
          'src/css/private.css'
        ],
        dest: 'src/private.css'
      }
    },
    replace: {
      dist: {
        options: {
          patterns: [
            {
              match: /"version": "[\d\.]+"/,
              replacement: '"version": "<%= pkg.version %>"',
              expression: true
            }, {
              match: /"description": ".+"/,
              replacement: '"description": "<%= pkg.description%>"',
              expression: true
            }, {
              match: /\?v[\d\.]+'/,
              replacement: '?v<%= pkg.version %>\'',
              expression: true
            }
          ]
        },
        files: {
          'src/manifest.json': 'src/manifest.json'
        }
      }
    },
    clean: {
      all: ['dist/'],
      build: [
        'dist/bootstrap/',
        'dist/js/',
        'dist/lib/',
        'dist/private/',
        'dist/seajs/'
      ]
    },
    copy: {
      dist: {
        files: [{expand: true, cwd: 'src/', src: ['**'], dest: 'dist/'}]
      }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      js: {
        src: [
          'src/js/**/*.js',
          'src/app.js'
        ]
      },
      privatejs: {
        src: [
          'src/private/**/*.js',
          'src/private-app.js'
        ]
      }
    },
    uglify: {
      options: {
        //banner: '<%= banner %>',
        mangle: {
          except: ['require']
        }
      },
      dist: {
        files: [{
          expand: true,
          cwd: 'dist/',
          src: '**/*.js',
          dest: 'dist/'
        }]
      }
    },
    cssmin: {
      options: {
        //banner: '<%= banner %>'
      },
      dist: {
        expand: true,
        cwd: 'dist/',
        src: '**/*.css',
        dest: 'dist/'
      }
    },
    zip: {
      dist: {
        src: 'dist/**',
        dest: 'dist.zip'
      }
    },
    watch: {
      options: {
        livereload: true
      },
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile', 'concat']
      },
      packagefile: {
        files: 'package.json',
        tasks: ['replace:dist']
      },
      css: {
        files: '<%= concat.css.src %>',
        tasks: ['concat:css']
      },
      jshint: {
        files: '<%= jshint.js.src %>',
        tasks: ['jshint:js']
      },
      js: {
        files: '<%= concat.js.src %>',
        tasks: ['concat:js']
      },
      privatecss: {
        files: '<%= concat.privatecss.src %>',
        tasks: ['concat:privatecss']
      },
      privatejshint: {
        files: '<%= jshint.privatejs.src %>',
        tasks: ['jshint:privatejs']
      },
      privatejs: {
        files: '<%= concat.privatejs.src %>',
        tasks: ['concat:privatejs']
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-replace');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-zip');

  // Default task.
  grunt.registerTask('default', ['replace', 'clean:all', 'copy', 'jshint', 'concat', 'uglify', 'cssmin', 'clean:build', 'zip']);

};
