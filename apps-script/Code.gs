// JSON API for the React form. Deploy as Web app: Execute as Me, access Anyone.
// Script property SPREADSHEET_ID = sheet id.
// Groups headers (row 1): group_id, name, meeting_days, meeting_time, status   (status "متاحة" = visible)
// Registrations headers: Timestamp, Student name, Student phone, Parent phone, Group, Status, UTM
const OPEN = 'متاحة';
const ss_ = () => SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID'));
const out_ = (o) => ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
const cell_ = (x) => x instanceof Date ? Utilities.formatDate(x, Session.getScriptTimeZone(), 'h:mm a') : String(x).trim();

function groups_() {
  const v = ss_().getSheetByName('Groups').getDataRange().getValues();
  const h = v.shift().map((s) => String(s).trim()), c = (n) => h.indexOf(n);
  return v.filter((r) => cell_(r[c('status')]) === OPEN).map((r) => ({
    id: cell_(r[c('group_id')]) || cell_(r[c('name')]),
    label: [r[c('name')], r[c('meeting_days')], r[c('meeting_time')]].map(cell_).filter(String).join(' · '),
  }));
}
function doGet() { return out_({ ok: true, groups: groups_() }); }
function doPost(e) {
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const d = JSON.parse(e.postData.contents);
    if (d.hp) return out_({ ok: true });
    const ph = /^01[0125]\d{8}$/, g = groups_().find((x) => x.id === d.groupId);
    if (!d.name || d.name.length > 100 || !ph.test(d.studentPhone) || !ph.test(d.parentPhone) || !g) return out_({ ok: false, error: 'invalid' });
    const sh = ss_().getSheetByName('Registrations'), r = sh.getLastRow() + 1;
    sh.getRange(r, 3, 1, 2).setNumberFormat('@'); // keep leading zero
    sh.getRange(r, 1, 1, 7).setValues([[new Date(), d.name, d.studentPhone, d.parentPhone, g.label, 'جديد', String(d.utm || '').slice(0, 300)]]);
    return out_({ ok: true });
  } catch (err) { return out_({ ok: false, error: String(err) }); }
  finally { lock.releaseLock(); }
}
