/* myFunctions.js — كل التوابع في ملف واحد (jQuery) */
$(function () {
  // بيانات السيارات: الرمز => [الاسم، السعر اليومي]
  var CARS = {
    'CR-001': ['Toyota Corolla', 250000], 'CR-002': ['Kia Sportage', 400000],
    'CR-003': ['Hyundai Elantra', 300000], 'CR-004': ['Chevrolet Spark', 180000],
    'CR-005': ['Renault Symbol', 150000]
  };
  var fmt = function (n) { return n.toLocaleString('en-US') + ' ل.س'; };

  // إظهار/إخفاء التفاصيل (يمكن فتح عدة سيارات معاً)
  $('input.det').click(function () { $('#d-' + this.value).fadeToggle(220); });
  $('input.pick').change(function () { $(this).closest('tr').toggleClass('sel', this.checked); });

  // زر متابعة: التحقق من وجود اختيار ثم إظهار النموذج
  $('#go').click(function () {
    var names = [];
    $('input.pick:checked').each(function () { names.push(CARS[this.value][0]); });
    if (names.length === 0) {
      $('#msg').text('اختر سيارة واحدة على الأقل ثم اضغط متابعة.');
      $('#bookForm').slideUp(150);
      return;
    }
    $('#msg').text('');
    $('#chosen').text('السيارات المختارة: ' + names.join('، '));
    $('#bookForm').slideDown(300, function () {
      $('html,body').animate({ scrollTop: $('#bookForm').offset().top - 80 }, 400);
    });
  });

  // تحويل نص yyyy-mm-dd إلى تاريخ حقيقي (أو null)
  function toDate(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    if (!m) { return null; }
    var d = new Date(+m[1], m[2] - 1, +m[3]);
    return (d.getMonth() === m[2] - 1 && d.getDate() === +m[3]) ? d : null;
  }
  // عرض/مسح رسالة الخطأ تحت الحقل
  function check(id, ok, msg) {
    $('#e-' + id).text(ok ? '' : msg);
    $('#f-' + id).toggleClass('bad', !ok);
    return ok;
  }

  // زر إرسال: التحقق من كل الحقول ثم الحساب
  $('#send').click(function (e) {
    e.preventDefault();
    var v = function (id) { return $.trim($('#f-' + id).val()); };
    var name = v('name'), nid = v('nid'), mob = v('mob'), mail = v('mail');
    var s = toDate(v('d1')), t = toDate(v('d2')), ok = true;

    ok = check('name', name === '' || /^[\u0621-\u064A]+(\s+[\u0621-\u064A]+)*$/.test(name), 'الاسم يقبل أحرفاً عربية فقط.') && ok;
    ok = check('nid', /^\d{11}$/.test(nid) && +nid.substr(0, 2) >= 1 && +nid.substr(0, 2) <= 14,
      'الرقم الوطني إلزامي: 11 رقماً، وأول رقمين من 01 إلى 14.') && ok;
    ok = check('d1', s !== null, 'تاريخ البداية إلزامي بصيغة yyyy-mm-dd.') && ok;
    ok = check('d2', t !== null && (s === null || t > s),
      t === null ? 'تاريخ النهاية إلزامي بصيغة yyyy-mm-dd.' : 'يجب أن يكون تاريخ النهاية لاحقاً لتاريخ البداية.') && ok;
    ok = check('mob', mob === '' || /^09[345689]\d{7}$/.test(mob), 'رقم غير مطابق لـ Syriatel (093 / 098 / 099) أو MTN (094 / 095 / 096).') && ok;
    ok = check('mail', mail === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail), 'صيغة البريد الإلكتروني غير صحيحة.') && ok;
    if (!ok) { return; }

    // الحساب: أيام التأجير × السعر اليومي لكل سيارة، وخصم 10% فوق 7 أيام
    var days = Math.round((t - s) / 86400000), total = 0, lines = '';
    $('input.pick:checked').each(function () {
      var c = CARS[this.value], sub = c[1] * days;
      total += sub;
      lines += '<li>' + c[0] + ' — ' + days + ' يوم × ' + fmt(c[1]) + ' = ' + fmt(sub) + '</li>';
    });
    var disc = days > 7 ? total * 0.10 : 0;
    $('#resBody').html('<ul>' + lines + '</ul><p>عدد أيام التأجير: ' + days + '</p><p>المجموع: ' + fmt(total) +
      '</p><p>الخصم: ' + (disc ? '10% (' + fmt(disc) + ')' : 'لا يوجد (المدة 7 أيام أو أقل)') +
      '</p><p class="tot">المبلغ النهائي: ' + fmt(total - disc) + '</p>');
    $('#res').fadeIn(250);
  });
  $('#res').click(function () { $(this).fadeOut(200); });
  $('.box').click(function (e) { e.stopPropagation(); });
  $('#resClose').click(function () { $('#res').fadeOut(200); });
});
