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
      dist: {
        //src: [],
        //dest: ''
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
          'src/manifest.json': 'src/manifest.json',
          'src/config.js': 'src/config.js',
          'src/bootstrap.js': 'src/bootstrap.js'
        }
      }
    },
    clean: ['dist/*', 'dist.zip'],
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
      dev: {
        src: 'src/js/**/*.js'
      },
      dist: {
        src: 'dist/js/**/*.js'
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
        tasks: ['jshint:gruntfile']
      },
      packagefile: {
        files: 'package.json',
        tasks: ['replace:dist']
      },
      devjs: {
        files: '<%= jshint.dev.src %>',
        tasks: ['jshint:dev']
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
  grunt.registerTask('default', ['replace', 'clean', 'copy', 'jshint', 'concat', 'uglify', 'cssmin', 'zip']);

};
