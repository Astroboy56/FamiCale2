# Firebase 登録手順（ステップバイステップ）

FamiCale2 を Firebase と連携するための設定手順です。

---

## ステップ 1: Firebase にアクセスする

1. ブラウザで **https://console.firebase.google.com/** を開く
2. **Google アカウント**でログインする（まだの場合はアカウントを作成）

---

## ステップ 2: プロジェクトを作成する

1. トップ画面で **「プロジェクトを追加」**（または「Create a project」）をクリック
2. **プロジェクト名**を入力（例: `FamiCale2` や `my-family-calendar`）
3. （任意）Google アナリティクスを有効にするか選択 → **「プロジェクトを作成」** をクリック
4. 作成完了まで数十秒待つ → **「続行」** をクリック

---

## ステップ 3: Firestore データベースを有効にする

1. 左メニュー **「Build」** → **「Firestore Database」** をクリック
2. **「データベースを作成」** をクリック
3. **セキュリティルール**の選択:
   - **本番環境向け**: 「本番モードで開始」を選ぶ（あとでルールを編集します）
   - **すぐ試したい場合**: 「テストモードで開始」を選ぶ（30日後など期限付きで全開放）
4. **ロケーション**を選択（例: `asia-northeast1`（東京））→ **「有効にする」** をクリック
5. 作成完了まで少し待つ

---

## ステップ 4: Web アプリを登録して設定値を取得する

1. 左メニューの **歯車アイコン** → **「プロジェクトの設定」** をクリック
2. **「全般」** タブの下までスクロールし、**「マイアプリ」** セクションへ
3. **「</>」（Web アイコン）** をクリックして Web アプリを追加
4. **アプリのニックネーム**を入力（例: `FamiCale2 Web`）→ **「アプリを登録」** をクリック
5. 表示される **「Firebase の設定」** の `firebaseConfig` をメモまたはコピーする  
   （後で環境変数に使います。**「このアプリでは Firebase Hosting を使用しません」** でOK）
6. **「コンソールに戻る」** をクリック

取得する値の例:
```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc..."
};
```

---

## ステップ 5: 環境変数をプロジェクトに設定する（詳細）

Firebase の設定値は **環境変数** としてアプリに渡します。次の 2 種類を設定します。

- **ローカル開発**: 自分のPCで `pnpm dev` するとき用 → `.env.local`
- **Vercel**: 本番・プレビュー用 → Vercel の Environment Variables

---

### 5-1. 各環境変数が Firebase のどこに対応するか

ステップ 4 で表示された **「Firebase の設定」** の `firebaseConfig` は、次の対応で環境変数にします。

| 環境変数名 | firebaseConfig のキー | 値の例 | 説明 |
|------------|------------------------|--------|------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `apiKey` | `AIzaSy...`（長い英数字） | API キー（必須） |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `authDomain` | `my-project.firebaseapp.com` | 認証用ドメイン |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `projectId` | `my-project-12345` | プロジェクト ID（必須） |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `storageBucket` | `my-project.appspot.com` | ストレージ用 |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` | `123456789012`（数字のみ） | FCM 用送信者 ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `appId` | `1:123456789:web:abc123...` | アプリ ID |

**コピーするときのコツ**: Firebase の画面では `apiKey: "AIzaSy..."` のように **ダブルクォートで囲まれた部分だけ** をコピーし、環境変数には **クォートなし** で貼り付けます。

---

### 5-2. ローカル開発用（.env.local）の作り方

#### ① ファイルを置く場所

- **必ず** プロジェクトの **ルートフォルダ** に置きます。  
  つまり `package.json` や `next.config.mjs` と同じ階層です。
- ファイル名は **`.env.local`** だけにします（先頭のドットを忘れずに）。

```
FamiCale2/
├── package.json
├── next.config.mjs
├── .env.local   ← ここに作成
├── app/
├── components/
└── ...
```

#### ② エディタで作成する手順（Cursor / VS Code の場合）

1. 左のファイルツリーで **プロジェクトルート（FamiCale2）** を右クリック
2. **「新しいファイル」** を選ぶ
3. ファイル名に **`.env.local`** と入力して Enter
4. 開いたファイルに、下の **「③ 書式」** のルールに従って 6 行を書く（または貼り付けて値を書き換える）

**Windows で「先頭がドットのファイルが作れない」場合**

- コマンドで作成: ターミナルでプロジェクトルートに移動して  
  `echo. > .env.local`（PowerShell の場合は `New-Item -Path .env.local -ItemType File`）
- または、一度 `env.local` で作成してから、ファイル名を `.env.local` に変更

#### ③ 書式のルール（重要）

- **1 行に 1 つ**の環境変数。形式は `変数名=値`（イコールの前後にスペースを入れない）
- **値はクォートで囲まない**（値にスペースや特殊文字が含まれる場合のみ、必要に応じてダブルクォートを使用）
- 行の途中に **#** を書くと、それ以降はコメント扱いになる
- 空行は入れてもよい

**正しい例:**
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=my-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=my-project-12345
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=my-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

**避ける例:**
```env
# ❌ イコールの前後にスペース
NEXT_PUBLIC_FIREBASE_API_KEY = AIzaSy...

# ❌ 値全体をクォートで囲む（Next.js では多くの場合そのまま読めるが、不要）
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSy..."

# ❌ 変数名の typo
NEXT_PUBLIC_FIREBASE_API_KEYE=AIzaSy...
```

#### ④ 値の入れ方（Firebase の画面から）

1. Firebase コンソールで **プロジェクトの設定** → **全般** → **マイアプリ** を開く
2. 登録した Web アプリの **「設定」**（歯車）または **「Firebase SDK スニペット」** を開く
3. `config` オブジェクトの中の **各キーの右側の値**（引用符の内側）をコピー
4. 上記の表に従って、対応する環境変数名の行の **`=` の右側** に貼り付ける

#### ⑤ 保存と Git について

- 編集したら **必ず保存**（Ctrl+S / Cmd+S）
- **`.env.local` は Git にコミットしない**。  
  プロジェクトに `.gitignore` があり、その中に `.env*.local` または `.env.local` が含まれていれば、通常はコミット対象外になります。

#### ⑥ 反映させるには

- 環境変数を **追加・変更したあと** は、**開発サーバーをいったん止めてから** もう一度 `pnpm dev` で起動し直してください。  
  （Next.js は起動時に環境変数を読み込むため、実行中のままでは変更が反映されません。）

---

### 5-3. Vercel でデプロイする場合の設定

Vercel にデプロイしたアプリでも Firebase を使うには、**Vercel 側** に同じ環境変数を登録します。

#### ① 開く場所

1. ブラウザで **https://vercel.com** を開き、ログインする
2. ダッシュボードで **FamiCale2 用のプロジェクト** をクリック
3. 上部タブの **「Settings」** をクリック
4. 左メニューから **「Environment Variables」** をクリック

#### ② 1 つずつ変数を追加する

1. **「Key」** の入力欄に変数名を **1 つ** 入力する（例: `NEXT_PUBLIC_FIREBASE_API_KEY`）
2. **「Value」** の入力欄に、Firebase の設定値（または `.env.local` の値）を貼り付ける
3. **「Environment」** で、どの環境で使うか選ぶ:
   - **Production**: 本番の URL で使うとき
   - **Preview**: プルリクなどプレビュー用 URL のとき
   - **Development**: Vercel の開発用（使う場合のみ）
   - 通常は **Production** と **Preview** にチェックを入れておけば十分です
4. **「Save」** をクリックする
5. 残り 5 個も同様に **Key / Value / Environment を選んで Save** を繰り返す

登録する 6 個の Key 一覧:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

#### ③ 反映のタイミング

- 変数を **追加・変更したあと** は、**もう一度デプロイ**（新しいデプロイを走らせる）しないと反映されません。  
  **「Deployments」** タブから **「Redeploy」** するか、Git にプッシュして新しいデプロイを発生させてください。

---

## ステップ 6: Firestore のセキュリティルールを設定する（詳細）

Firestore では、**誰がどのコレクションを読んだり書いたりできるか** を「ルール」で指定します。ルールを設定しない、または厳しすぎる設定のままにすると、アプリから「権限がありません」エラーになり、メンバー・予定・共有ボードのデータを読み書きできません。

---

### 6-1. ルールを編集する画面を開く

1. ブラウザで **https://console.firebase.google.com/** を開き、対象の **プロジェクト** を選ぶ
2. 左メニュー **「Build」**（ビルド）をクリック
3. 表示された一覧から **「Firestore Database」** をクリック
4. 画面中央より上にある **「ルール」** タブをクリック  
   （同じ行に「データ」「インデックス」「使用量」などのタブがあります）
5. 大きなテキストエリアに、現在のルールが表示されます  
   - 初回は **テストモード** のルール（`if request.time < ...` のような日付条件）や、  
     **本番モード** で開始した場合は `allow read, write: if false;` だけのブロックになっていることがあります

---

### 6-2. ルールの内容を理解する

FamiCale2 では、次の **3 つのコレクション** を使います。

| コレクション名 | 用途 |
|----------------|------|
| `members` | 家族メンバー（名前・色） |
| `events` | カレンダー予定 |
| `boardMemos` | 共有ボードのメモ |

ルールは **「このパス（コレクション）に対して、読み取り（read）・書き込み（write）を許可するか」** を書きます。

- **`match /members/{docId}`**  
  → `members` コレクション内の各ドキュメント（`{docId}` はどのドキュメントでもよいという意味）
- **`allow read, write: if true;`**  
  → 読み取りも書き込みも **常に許可**（誰でもアクセス可能）

つまり、下記のルールは「`members` / `events` / `boardMemos` の 3 つについて、誰でも読み書きしてよい」という意味です。

---

### 6-3. コピーして使うルール（全文）

次のブロック **全体** をコピーし、ステップ 6-4 の手順で Firestore のルールエリアに貼り付けます。

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /members/{docId} {
      allow read, write: if true;
    }
    match /events/{docId} {
      allow read, write: if true;
    }
    match /boardMemos/{docId} {
      allow read, write: if true;
    }
  }
}
```

**書式のポイント**

- 1 行目 **`rules_version = '2';`** は必ずそのまま残す（Firestore のルール言語のバージョン指定）
- **`service cloud.firestore { ... }`** の波括弧の中に、すべての `match` を書く
- **`match /databases/{database}/documents { ... }`** の内側に、コレクションごとの `match` を書く
- 各 `match` の最後は **セミコロン `;`** で終わる
- コレクション名（`members` / `events` / `boardMemos`）を **スペルミスしない** こと（アプリのコードと一致させる）

---

### 6-4. ルールを貼り付けて公開する手順

1. **「ルール」** タブを開いた状態で、テキストエリア内の **既存の内容をすべて選択**（Ctrl+A / Cmd+A）
2. **削除** する（Backspace や Delete）
3. 上記 **6-3 のルール全文** を **貼り付け**（Ctrl+V / Cmd+V）
4. 書き損じや余分なスペースがないか **目視で確認** する
5. 画面上部または下部にある **「公開」**（Publish）ボタンをクリックする
6. 確認ダイアログが出たら **「公開」** を再度クリックする
7. 「ルールが正常に公開されました」などのメッセージが出れば完了

**注意**

- **「公開」** を押さないと、編集した内容は **保存されません**。必ず「公開」まで実行してください。
- 公開後はすぐに反映されます。アプリ側で再読み込みや再操作をすれば、新しいルールが適用されます。

---

### 6-5. ルールを設定し忘れた場合・間違えた場合

- **ルールが厳しすぎる**（例: 本番モードのまま `allow read, write: if false;` のみ）  
  → アプリでメンバー追加・予定追加・共有ボードの投稿をすると、  
    **「Missing or insufficient permissions」**（権限がありません）のようなエラーになります。
- **コレクション名の typo**（例: `member` と書いてしまった）  
  → そのコレクションだけ読み書きできず、同じく権限エラーになります。
- その場合は **6-1 ～ 6-4** をやり直し、正しいルールを貼り付けて **「公開」** してください。

---

### 6-6. セキュリティについて（重要）

上記のルールは **「誰でも読み書きできる」** 設定です。

- **家族だけが使う**・**URL を共有しない**ような利用であれば、このままでも問題ないことが多いです。
- **不特定多数がアクセスする本番サービス** にする場合は、**Firebase Authentication** でログインさせ、ルールを  
  **`allow read, write: if request.auth != null;`** のように「ログインしている人だけ」に制限するなど、ルールを厳しくすることを検討してください。

まずはこのルールでアプリが動くことを確認し、必要に応じてあとから認証とルールを強化する流れでよいです。

---

## ステップ 7: 動作確認する

1. ターミナルでプロジェクトフォルダに移動し、開発サーバーを起動:
   ```bash
   pnpm dev
   ```
2. ブラウザで **http://localhost:3000** を開く
3. 画面上部の **「デモモード - Firebase環境変数を設定すると…」** のバナーが **表示されなければ** Firebase 連携は有効です
4. **メンバー**を追加するか、**予定**や**共有ボード**に1件追加し、Firebase コンソールの **「Firestore Database」→「データ」** でドキュメントが増えているか確認する

---

## チェックリスト

- [ ] Firebase にログインし、プロジェクトを作成した
- [ ] Firestore Database を有効にした
- [ ] Web アプリを追加し、`firebaseConfig` をコピーした
- [ ] `.env.local` に環境変数を設定した（Vercel の場合は Environment Variables も）
- [ ] Firestore のルールで `members` / `events` / `boardMemos` の読み書きを許可した
- [ ] `pnpm dev` で起動し、デモバナーが消えていることと、データが Firestore に保存されることを確認した

---

## トラブルシューティング

| 現象 | 確認すること |
|------|---------------------|
| ずっと「デモモード」と表示される | `NEXT_PUBLIC_FIREBASE_API_KEY` と `NEXT_PUBLIC_FIREBASE_PROJECT_ID` が正しく設定されているか。設定後は **開発サーバーを再起動**する。 |
| 読み書きでエラーになる | Firestore の「ルール」で上記 3 コレクションの `read, write` が許可されているか。 |
| インデックスのエラーが出る | エラーメッセージ内のリンクから Firestore のインデックスを作成する。 |

---

### 「Firebase にデータが入らない」場合の確認手順

1. **デモモードかどうか**
   - 画面上部に「デモモード - Firebase環境変数を〜」のバナーが **表示されている**  
     → Firebase は使われておらず、データはローカル（メモリ）にのみ保存されます。ページをリロードすると消えます。
   - バナーが **表示されていない**  
     → Firebase モードです。次の項目を確認してください。

2. **エラートーストの有無**
   - メンバー追加・予定追加・共有ボード投稿時に **赤いエラートースト** が出る  
     → 表示されたエラーメッセージを確認してください。
   - **「Missing or insufficient permissions」** や **「権限がありません」**  
     → Firestore のセキュリティルールが厳しすぎます。ステップ 6 のルールを設定し直し、「公開」を押してください。
   - **「Firebase: Error (auth/...)」** など  
     → Firebase の設定やプロジェクトの状態を確認してください。

3. **Firestore の作成**
   - Firebase コンソール → **Build** → **Firestore Database** で、データベースが作成済みか確認してください。
   - 未作成の場合は「データベースを作成」から作成してください。

4. **Firestore のルール**
   - **ルール** タブで、`members` / `events` / `boardMemos` の 3 つについて  
     `allow read, write: if true;` が含まれているか確認してください。

5. **プロジェクトの一致**
   - `.env.local` の `NEXT_PUBLIC_FIREBASE_PROJECT_ID` が、  
     Firebase コンソールで開いているプロジェクトの ID と一致しているか確認してください。

---

以上で Firebase への登録とアプリ側の設定は完了です。
