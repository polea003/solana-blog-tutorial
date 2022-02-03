import { fileURLToPath } from 'url'
import path from 'path'
import { dirname } from 'path'
import spawn from 'cross-spawn'
import { Keypair, Connection, LAMPORTS_PER_SOL, clusterApiUrl } from '@solana/web3.js'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const projectName = 'blog_tutorial'

function readKeyfile(keypairFile) {
    let kf = fs.readFileSync(keypairFile)
    console.log(JSON.parse(kf.toString()))
    let parsed = JSON.parse(kf.toString())
    kf = new Uint8Array(parsed)
    const keypair = new Keypair({
        secretKey: kf.slice(0,32),
        publicKey: kf.slice(32,64),
    })
    console.log(keypair.publicKey.toString())
    return keypair
}

const programAuthorityKeyfileName = 'deploy/programauthority-keypair.json'

const programAuthorityKeypairFile = path.resolve(
    `${__dirname}${path.sep}${programAuthorityKeyfileName}`
)

const connection = new Connection(clusterApiUrl('devnet'), 'confirmed')

;(async() => {

    let method
    let programAuthorityKeypair
    let programId
    let programKeypair

    programKeypair = readKeyfile(programAuthorityKeypairFile)
    console.log('publicKey')
    console.log(programKeypair.publicKey)
    programId = programKeypair.publicKey.toString()

    if (!fs.existsSync(programAuthorityKeypairFile)) {
        //doesnt exist
        spawn.sync('anchor', ['build'], { stdio: 'inherit' })

        programAuthorityKeypair = new Keypair()
        // 2 is max SOL that can be airdropped
        let signature = await connection.requestAirdrop(programAuthorityKeypair.publicKey, LAMPORTS_PER_SOL * 2)
        await connection.confirmTransaction(signature, 'confirmed')

        const balance = await connection.getBalance(programAuthorityKeypair.publicKey, 'confirmed')

        console.log('\n\ncreated keypair\n')
        console.log(`\n\n Saving Keypair public key:  ${programAuthorityKeypair.publicKey}\n` )

        fs.writeFileSync(
            programAuthorityKeypairFile,
            `[${Buffer.from(
                programAuthorityKeypair.secretKey.toString()
            )}]`
        )

        // method = ['deploy']

    } else {
        // does exist
        // "upgrade" command has been deprecated since tutorial was made. Now both deploy and upgrade use saem "deploy" command
        // method = ['upgrade']
        
        // programAuthorityKeypair = readKeyfile(programAuthorityKeypairFile)

        // method = [
        //     'deploy',
        //     // `${programAuthorityKeypairFile}`,
        //     // `./target/deploy/${projectName}.so`,
        //     // '--program-id',
        //     // programId
        // ]

    }
    
    method = ['deploy']

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


