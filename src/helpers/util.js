import moment from 'moment-jalaali';

export default {
  bytesToSize(bytes) {
    const TBVal = 1024 * 1024 * 1024 * 1024;
    const GBVal = 1024 * 1024 * 1024;
    const MBVal = 1024 * 1024;
    const KBVal = 1024;

    if (bytes >= TBVal) {
      return (bytes / TBVal).toFixed(2) + ' TB';
    } else if (bytes >= GBVal) {
      return (bytes / GBVal).toFixed(2) + ' GB';
    } else if (bytes >= MBVal) {
      return (bytes / MBVal).toFixed(2) + ' MB';
    } else if (bytes >= KBVal) {
      return (bytes / KBVal).toFixed(2) + ' KB';
    } else if (bytes >= 0) {
      return bytes.toString() + ' Byte';
    }

    return '0 Byte';
  },

  getExtFromName(name) {
    let ext = /(?:\.([^.]+))?$/.exec(name);

    return {
      fileName: name.substr(0, name.length - (ext[0] || '').length),
      extension: ext[1] || '',
    };
  },

  bytesToSizeFa(bytes) {
    const TBVal = 1024 * 1024 * 1024 * 1024;
    const GBVal = 1024 * 1024 * 1024;
    const MBVal = 1024 * 1024;
    const KBVal = 1024;

    if (bytes >= TBVal) {
      return (bytes / TBVal).toFixed(2) + ' ترابایت';
    } else if (bytes >= GBVal) {
      return (bytes / GBVal).toFixed(2) + ' گیگابایت';
    } else if (bytes >= MBVal) {
      return (bytes / MBVal).toFixed(2) + ' مگابایت';
    } else if (bytes >= KBVal) {
      return (bytes / KBVal).toFixed(2) + ' کیلوبایت';
    } else if (bytes >= 0) {
      return bytes.toString() + ' بایت';
    }

    return 'صفر بایت';
  },

  fileDateFa(standardTime) {
    moment.loadPersian({
      dialect: 'persian-modern',
    });

    try {
      return this.toPersinaDigit(moment(standardTime).format('jDD jMMMM jYYYY'));
    } catch {
      return '-';
    }
  },

  fileDateTimeFa(standardTime) {
    moment.loadPersian({
      dialect: 'persian-modern',
    });

    return this.toPersinaDigit(moment(standardTime).format('HH:mm:ss\t\tjDD jMMMM jYYYY'));
  },

  getDaysInMonth(standardTime) {
    let _moment = moment(standardTime);

    return _moment
      .jMonth(_moment.jMonth() + 1)
      .jDate(0)
      .jDate();
  },

  getMonth(standardTime) {
    return moment(standardTime).jMonth() + 1;
  },

  getYear(standardTime) {
    return moment(standardTime).jYear();
  },

  toPersinaDigit(digit) {
    let fa = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

    return digit.toString().replace(/[0-9]/g, function(w) {
      return fa[+w];
    });
  },

  multipleListeners(element, events, handler, useCapture, remove = false) {
    if (!(events instanceof Array)) {
      throw new SyntaxError(`multipleListeners: please supply an array of eventstrings`);
    }

    for (let i = 0; i < events.length; i += 1) {
      if (remove) {
        element.removeEventListener(events[i], handler, useCapture);
      } else {
        element.addEventListener(events[i], handler, useCapture);
      }
    }
  },

  activityName(kind) {
    switch (kind) {
      case 'DOWNLOAD':
        return 'دانلود';
      case 'UPLOAD':
        return 'بارگذاری';
      case 'MOVE':
        return 'انتقال';
      case 'COPY':
        return 'کپی';
      case 'RENAME':
        return 'تغییر نام';
      case 'CREATE':
        return 'ساخت پوشه';
      case 'SHARE':
        return 'اشتراک گذاری';
      case 'UNSHARE':
        return 'حذف اشتراک گذاری';
      case 'PUBLIC':
        return 'عمومی سازی';
      case 'TRASH':
        return 'حذف';
      case 'RESTORE':
        return 'بازگردانی';
      default:
        return kind;
    }
  },

  getFileIcon(detail, otherCheck) {
    const filesTypeSupported = [
      'docx',
      'doc',
      'xls',
      'xlsx',
      'gif',
      'jpg',
      'jpeg',
      'mkv',
      'ogv',
      'mp3',
      'mp4',
      'pdf',
      'png',
      'rar',
      'txt',
      'zip',
      'mov',
      'webm',
    ];
    const extension = detail.extension ? detail.extension.toLowerCase() : 'folder';
    return otherCheck && extension && filesTypeSupported.includes(extension)
      ? `file-${extension}`
      : `file-unknown`;
  },

  mapKeyIdToHashFile(data) {
    let dataWithHashFileIndexKey = {};

    data.forEach((item, index) => {
      dataWithHashFileIndexKey = { ...dataWithHashFileIndexKey, [item.hash]: { ...item, index } };
    });

    return dataWithHashFileIndexKey;
  },

  recentsMapKeyIdToHashFile(data) {
    let dataWithHashFileIndexKey = {};

    data.forEach(item => {
      Object.assign(dataWithHashFileIndexKey, { [item.entity.hash]: item });
    });

    return dataWithHashFileIndexKey;
  },

  scrollToPosition(element, to, duration) {
    //t = current time
    //b = start value
    //c = change in value
    //d = duration
    const easeInOutQuad = (t, b, c, d) => {
      t /= d / 2;
      if (t < 1) return (c / 2) * t * t + b;
      t--;
      return (-c / 2) * (t * (t - 2) - 1) + b;
    };
    let start = element.scrollTop,
      change = to - start,
      currentTime = 0,
      increment = 20;

    let animateScroll = function() {
      currentTime += increment;
      let val = easeInOutQuad(currentTime, start, change, duration);
      element.scrollTop = val;

      if (currentTime < duration) {
        setTimeout(animateScroll, increment);
      }
    };

    animateScroll();
  },
  getUrlParams(queryParams) {
    const hashes = queryParams.slice(queryParams.indexOf('?') + 1).split('&');
    const params = {};

    hashes.map(hash => {
      const [key, val] = hash.split('=');
      params[key] = decodeURIComponent(val);
      return null;
    });

    return params;
  },
  convertToQueryString(objectParams) {
    return Object.keys(objectParams)
      .map(key => key + '=' + objectParams[key])
      .join('&');
  },
  checkValidDate(date) {
    return new Date(date).getTime() ? true : false;
  },
  dataURLtoFile(dataurl, filename) {
    var arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  },
  mobileAndTabletCheck() {
    let check = false;
    (function(a) {
      if (
        /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(
          a,
        ) ||
        /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
          a.substr(0, 4),
        )
      )
        check = true;
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
  },
  getFileType(extension) {
    const videoExtensions = ['mp4', 'mov', 'webm', 'mkv', 'ogv'];
    const audioExtensions = ['mp3', 'aac', 'ogg', 'flac', 'alac', 'wav', 'aiff', 'dsd'];
    const imageExtensions = ['tif', 'tiff', 'gif', 'png', 'eps', 'jpeg', 'jpg', 'raw'];
    if (extension && extension.toLowerCase() === 'pdf') {
      return 'PDF';
    } else if (extension && videoExtensions.includes(extension.toLowerCase())) {
      return 'VIDEO';
    } else if (extension && audioExtensions.includes(extension.toLowerCase())) {
      return 'AUDIO';
    } else if (extension && imageExtensions.includes(extension.toLowerCase())) {
      return 'IMAGE';
    } else {
      return 'UNKNOWN';
    }
  },
  getFilterByPath() {
    const pathName = window.location.pathname;
    switch (true) {
      case pathName.startsWith('/bookmark'):
        return {
          path: '/bookmark',
          name: 'نشان شده ها',
          filter: 'favorite',
        };
      case pathName.startsWith('/recent'):
        return {
          path: '/recent',
          name: 'فایل های اخیر',
          filter: 'lastmod',
        };
      case pathName.startsWith('/search'):
        return {
          path: '/search',
          name: 'جست و جو',
          filter: 'search',
        };
      case pathName.startsWith('/shared-with-me'):
        return {
          path: '/shared-with-me',
          name: 'مشترک شده با من',
          filter: 'shared',
        };
      case pathName.startsWith('/trash'):
        return {
          path: '/trash',
          name: 'سطل بازیافت',
          filter: 'trash',
        };
      default:
        return {
          path: '/my-space',
          name: 'همه ی فایل ها',
          filter: 'mybox',
        };
    }
  },

  cancelablePromise(promise) {
    let isCanceled = false;

    const wrappedPromise = new Promise((resolve, reject) => {
      promise.then(
        value => (isCanceled ? reject({ isCanceled, value }) : resolve(value)),
        error => reject({ isCanceled, error }),
      );
    });

    return {
      promise: wrappedPromise,
      cancel: () => (isCanceled = true),
    };
  },
  delay(n) {
    return new Promise(resolve => setTimeout(resolve, n));
  },
};
