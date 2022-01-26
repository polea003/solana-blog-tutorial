use anchor_lang::prelude::*;
use std::str::from_utf8;

declare_id!("9XawnpbDwsnpWZLXj8MZ8McnVpf3TStTQQ3egrSobws7");

#[program]
pub mod blog_tutorial {
    use super::*;
    pub fn initialize(ctx: Context<Initialize>) -> ProgramResult {
        let blog_account = &mut ctx.accounts.blog_account;
        blog_account.authority = *ctx.accounts.authority.key;
        Ok(())
    }

    pub fn make_post(
        ctx: Context<MakePost>,
        new_post: Vec<u8>
    ) -> ProgramResult {
        let post = from_utf8(&new_post).map_err(|err| {
            msg!("invalid UTF-8, from byte {}", err.valid_up_to());
            ProgramError::InvalidInstructionData
        })?;
        msg!(post);

        let blog_acc = &mut ctx.accounts.blog_account;
        blog_acc.latest_post = new_post;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 // account discriminator
        + 32 // pubkey
        + 566 // blog post data max 566 bytes
    )]
    pub blog_account: Account<'info, BlogAccount>,
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
pub struct MakePost<'info> {
    #[account(mut,
        has_one = authority
    )]
    pub blog_account: Account<'info, BlogAccount>,
    pub authority: Signer<'info>
}

#[account]
pub struct BlogAccount {
    pub latest_post: Vec<u8>,
    pub authority: Pubkey 
}
