import { fileURLToPath } from 'url'
import path from 'path'
import { dirname } from 'path'
import spawn from 'cross-spawn'
import { Keypair, Connection, LAMPORTS_PER_SOL, clusterApiUrl } from '@solana/web3.js'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const projectName = 'blog_tutorial'

const programAuthorityKeyfileName = 'deploy/programauthority-keypair.json'

const programAuthorityKeypairFile = path.resolve(
    `${__dirname}${path.sep}${programAuthorityKeyfileName}`
)

const connection = new Connection(clusterApiUrl('devnet'), 'confirmed')

;(async() => {

    let method

    if (!fs.existsSync(programAuthorityKeypairFile)) {
        //doesnt exist
        spawn.sync('anchor', ['build'], { stdio: 'inherit' })

        let programAuthorityKeypair = new Keypair()
        let signature = await connection.requestAirdrop(programAuthorityKeypair.publicKey, LAMPORTS_PER_SOL * 2)
        await connection.confirmTransaction(signature, 'confirmed')

        // let confirmation = await connection.requestAirdrop(programAuthorityKeypair.publicKey, LAMPORTS_PER_SOL );

        // let result = await connection.confirmTransaction(confirmation, 'confirmed');


        const balance = await connection.getBalance(programAuthorityKeypair.publicKey, 'confirmed')
        console.log('\n\n\n')
        console.log('balance: ')
        console.log(balance / LAMPORTS_PER_SOL)
        console.log('\n\n\n')


        console.log('\n\ncreated keypair\n')
        console.log(`\n\n Saving Keypair public key:  ${programAuthorityKeypair.publicKey}\n` )

        fs.writeFileSync(
            programAuthorityKeypairFile,
            `[${Buffer.from(
                programAuthorityKeypair.secretKey.toString()
            )}]`
        )

        method = ['deploy']

    } else {
        // does exist
        method = ['deploy']
        // method = ['upgrade']

    }

    spawn.sync(
        'anchor',
        [
            ...method,
            '--provider.cluster',
            'Devnet',
            '--provider.wallet',
            `${programAuthorityKeypairFile}`,
        ],
        { stdio: 'inherit' }
    )

    fs.copyFile(
        `target/idl/${projectName}.json`,
        `app/src/services/idl/${projectName}.json`,
        (err) => {
            if (err) throw errconsole.log(`${projectName}.json was copied to ./app/services/idl`)
        }
    )
})()


