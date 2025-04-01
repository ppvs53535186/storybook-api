# 將專案上傳至 GitHub 的指南

由於目前的開發環境不支援 Git 操作，您需要遵循以下步驟在本地電腦上將專案上傳至 GitHub：

## 步驟 1: 下載專案檔案

1. 在開發環境中，使用介面提供的「下載專案」功能下載整個專案的壓縮檔
2. 在您的本地電腦上解壓縮檔案

## 步驟 2: 在 GitHub 上建立新儲存庫

1. 登入您的 [GitHub 帳戶](https://github.com/)
2. 點擊右上角的 "+" 圖示，選擇 "New repository"
3. 輸入儲存庫名稱（例如："storybook-api"）
4. 為您的專案新增描述（選填）
5. 選擇儲存庫的可見性（公開或私有）
6. 不要勾選「使用 README 初始化此儲存庫」
7. 點擊「建立儲存庫」

## 步驟 3: 在本地初始化 Git 儲存庫並上傳檔案

在您的本地電腦上打開終端機，導航到專案資料夾，然後執行以下命令：

```bash
# 進入專案目錄
cd 您的專案目錄路徑

# 初始化 Git 儲存庫
git init

# 新增所有檔案到暫存區
git add .

# 提交變更
git commit -m "Initial commit"

# 設定遠端儲存庫 URL（替換成您的 GitHub 儲存庫 URL）
git remote add origin https://github.com/您的使用者名稱/您的儲存庫名稱.git

# 推送到 GitHub
git push -u origin main
```

注意：如果您的預設分支是 `master` 而不是 `main`，請將最後一個命令中的 `main` 替換為 `master`：

```bash
git push -u origin master
```

## 步驟 4: 驗證上傳

1. 重新整理您的 GitHub 儲存庫頁面
2. 確認專案的所有檔案都已經成功上傳

## .gitignore 檔案

專案已經包含了一個合適的 `.gitignore` 檔案，這將避免一些不必要的檔案（如 `node_modules/` 和 `.env`）被提交到 Git 儲存庫。確保此檔案被包含在您的提交中。