-- CreateTable
CREATE TABLE user_meetime_accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  meetime_user_id BIGINT NOT NULL,
  created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  
  CONSTRAINT user_meetime_accounts_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES monitoria_users(id) 
    ON DELETE CASCADE,
    
  CONSTRAINT user_meetime_accounts_meetime_user_id_fkey 
    FOREIGN KEY (meetime_user_id) 
    REFERENCES meetime_users(id) 
    ON DELETE CASCADE,
    
  CONSTRAINT user_meetime_accounts_unique 
    UNIQUE (user_id, meetime_user_id)
);

-- CreateIndex
CREATE INDEX idx_user_meetime_accounts_user_id 
  ON user_meetime_accounts(user_id);
  
-- CreateIndex
CREATE INDEX idx_user_meetime_accounts_meetime_user_id 
  ON user_meetime_accounts(meetime_user_id);

