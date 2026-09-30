# CapstoneMatch DS Builder (Figma plugin)

Plugin dựng phần Figma sau trong file của nhóm:

| Bước (menu plugin) | Tạo ra |
|---|---|
| **1 · Design System (trang 04)** | 86 Variables (Color · Light, Spacing, Radius, Size, Typography, Elevation), 7 text style, 3 effect style gắn với biến, bảng tài liệu kèm tỉ lệ tương phản |
| **2 · Components (trang 05)** | 9 component bắt buộc và các component phụ (Badge, Banner, Chip, Progress, Tabs, Snackbar…), tất cả Auto Layout + variant, gắn biến |
| **3 · Final UI (trang 03)** | SCR_01 → SCR_09 với 44 trạng thái và 9 frame kiểm tra 412 dp, toàn bộ là instance |
| **4 · User Flow (trang 01)** | 3 flow (đường chính / thay thế / lỗi–khôi phục), mỗi bước link tới màn hình, kèm bảng flow → màn |
| **5 · Wireframe (trang 02)** | Bản xám low-fi của 9 màn |
| **6 · Prototype (trang 06)** | Flow 1, 2, 3, 3b bấm được, có điểm bắt đầu, dialog overlay, loading → kết quả, Back |

Chạy theo thứ tự 1 → 6. Nếu chạy lại bước 3 (màn hình được dựng lại, ID đổi), hãy chạy lại cả 4, 5 và 6 để link và prototype trỏ đúng frame mới.

## Cách chạy

1. Cài **Figma desktop** (plugin phát triển chỉ import được trên bản desktop) và mở file Figma của nhóm.
2. `Menu → Plugins → Development → Import plugin from manifest…` rồi chọn `tools/figma-plugin/manifest.json`.
3. `Plugins → Development → CapstoneMatch DS Builder` và chạy **lần lượt từng bước 1 → 2 → 3**. Không nên dùng "Chạy cả 3 bước", xem lý do ở dưới.

### Không có Figma desktop: chạy trên Figma web

Figma web cho phép gọi Plugin API qua biến `figma` trong DevTools console. Cách làm:

1. Mở file của nhóm trên figma.com và bấm `F12` → Console.
2. Dán đoạn dưới đây, đổi `STEP` thành `'tokens'`, `'components'` hoặc `'screens'`, rồi Enter.

Đoạn này nạp `code.js` từ nhánh trên GitHub. Nó phải dùng wrapper vì các thuộc tính của `figma` trên web không cấu hình lại được, nên dùng `Proxy` sẽ báo lỗi.

```js
const STEP = 'tokens';
const src = await (await fetch('https://raw.githubusercontent.com/DEVORGANIZE222/PRM323_LAB2_uiuxdesign/feat/figma-design-system-scr06-09/tools/figma-plugin/code.js')).text();
const real = figma, w = {}, seen = new Set(['command', 'closePlugin']);
Object.defineProperty(w, 'command', { value: STEP });
Object.defineProperty(w, 'closePlugin', { value: (m) => console.log(m) });
for (let o = real; o && o !== Object.prototype; o = Object.getPrototypeOf(o))
  for (const k of Object.getOwnPropertyNames(o)) if (!seen.has(k)) { seen.add(k);
    Object.defineProperty(w, k, { get: () => (typeof real[k] === 'function' ? real[k].bind(real) : real[k]) }); }
new Function('figma', src)(w);
```

Chạy lại:
- **Bước 1:** cập nhật giá trị biến tại chỗ, không tạo biến trùng, và dựng lại bảng tài liệu trang 04.
- **Bước 2:** nếu trang 05 đã có component thì giữ nguyên, để không làm gãy instance mà các màn khác đang dùng. Muốn dựng lại thì xoá board `Components · CapstoneMatch` trước.
- **Bước 3:** xoá section cũ rồi dựng lại.

## Component (trang 05)

| # | Component | Variant / state | Flutter |
|---|---|---|---|
| ① | Button | Type: Primary, Secondary, Destructive, Text × State: Default, Pressed, Disabled, Loading | FilledButton / OutlinedButton / TextButton |
| ② | Text Field | Default, Focused, Filled, Error, Disabled | TextFormField |
| ③ | Card | Selectable (Default, Pressed, Selected), Member, Open slot, Notification (Default, Unread, Pressed), Info (Default, Pressed) | Card + InkWell |
| ④ | Bottom Nav (+ Nav Item) | Selected: Home, Browse, My Group, Alerts | NavigationBar |
| ⑤ | App Bar | Default, Back, Actions | AppBar |
| ⑥ | Dialog | Confirmation, Destructive | AlertDialog |
| ⑦ | Loading | Skeleton, Spinner, Overlay | Shimmer / CircularProgressIndicator |
| ⑧ | Empty State | Screen, Compact | Column(Icon, Text, FilledButton) |
| ⑨ | Error State | Screen, Inline | Column(Icon, Text, FilledButton.icon) |
| + | Icon (30 icon), Icon Button, Avatar, Badge, Banner, Segmented Tabs, Snackbar, Status Bar | | |

## Màu đã sửa

Đo bằng công thức WCAG 2.1. Các giá trị trong `DESIGN.md` gốc được ghi là đạt, nhưng thực tế một số cặp không đạt:

| Token | Cũ → Mới | Tương phản |
|---|---|---|
| primary (nền nút) | `#F27024` → `#AD4A0A` | chữ trắng 2.95 → 5.58:1 (`#F27024` giữ lại làm `brand-orange`, chỉ dùng trang trí) |
| warning | `#B26A00` → `#8F5400` | trên nền trắng 4.24 → 6.11:1 |
| success | `#0D8244` → `#0A6E38` | trên `#E6F4EA` 4.31 → 5.60:1 |
| outline (viền ô nhập) | `#E1E3E5` → `#737980` | 1.29 → 4.40:1 (thành phần UI cần ≥ 3:1) |
| on-disabled | `#8E9192` → `#5E6469` | trên `#E1E3E5` 2.47 → 4.66:1 |

Các bạn phụ trách `design-decisions.md`, `DESIGN.md` và `flutter-handoff.md` nên cập nhật theo bảng này. Những tài liệu đó hiện vẫn ghi `#F27024` với chữ trắng đạt 4.8:1, điều này không đúng.

## Vì sao nên chạy từng bước

Mục 10 của đề ghi rõ: giảng viên xem version history của Figma, và *"a file that appears complete in one save will be questioned"* (file hoàn chỉnh chỉ sau một lần lưu sẽ bị nghi vấn). Vì vậy:
- Chạy mỗi bước vào một buổi khác nhau.
- Sau mỗi bước, tự chỉnh thêm trong Figma (canh lại, đổi nội dung, nối prototype…).
- Đặt tên version sau mỗi bước bằng `File → Save to version history`.

## Minh bạch về AI

Plugin này được viết với sự hỗ trợ của Claude (Anthropic). Theo mục 5 và 10 của đề, cần ghi việc này vào `ai/ai-design-log.md`, gồm công cụ và mục đích: dựng design system, component và màn hình bằng script.
