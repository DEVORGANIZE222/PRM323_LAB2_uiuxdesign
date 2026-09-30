# CapstoneMatch DS Builder (Figma plugin)

Plugin dựng phần Figma sau trong file của nhóm:

| Bước (menu plugin) | Tạo ra |
|---|---|
| **1 · Design System (trang 04)** | 83 Variables (Color · Light, Spacing, Radius, Size, Typography, Elevation), 7 text style và 3 effect style gắn với biến, bảng tài liệu trên trang `04 Design System` (swatch kèm tỉ lệ tương phản, bảng màu đã sửa, type scale, spacing, radius, elevation, touch target) |
| **2 · Components (trang 05)** | 9 component bắt buộc + component phụ, tất cả Auto Layout + variant, mọi fill/stroke/padding/gap/radius/size đều bind vào biến |
| **3 · Final UI SCR_06 → SCR_09 (trang 03)** | 24 frame 360 × 800 (màn + từng state đặt cạnh nhau) và 4 frame kiểm tra ở 412 dp, dựng hoàn toàn bằng instance của trang 05 |

Plugin tự tạo đủ 6 trang theo đúng thứ tự `01 User Flow … 06 Prototype`. Nó không đụng vào nội dung các trang khác đã có sẵn. Trên trang 03, section của SCR_06–09 được đặt bên phải phần SCR_01–05 của các bạn khác.

## Cách chạy

1. Cài **Figma desktop** (plugin phát triển chỉ import được trên bản desktop) và mở file Figma của nhóm.
2. `Menu → Plugins → Development → Import plugin from manifest…` rồi chọn `tools/figma-plugin/manifest.json`.
3. `Plugins → Development → CapstoneMatch DS Builder` và chạy **lần lượt từng bước 1 → 2 → 3**. Không nên dùng "Chạy cả 3 bước", xem lý do ở dưới.

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
