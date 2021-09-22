import {MigrationInterface, QueryRunner, TableColumn, TableForeignKey} from "typeorm";

export class AddColumnSenderIdToStatements1632179450323 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn('statements', new TableColumn({
          name: 'sender_id',
          type: 'uuid'
        }))

        await queryRunner.createForeignKey('statements', new TableForeignKey({
          name: 'sender',
          columnNames: ['sender_id'],
          referencedTableName: 'users',
          referencedColumnNames: ['id'],
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        }))

        await queryRunner.changeColumn('statements', 'type', new TableColumn({
          name: 'type',
          type: 'enum',
          enum: ['deposit', 'withdraw', 'transfer']
        }))
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.dropForeignKey('statements', 'sender')
      await queryRunner.dropColumn('statements', 'sender_id')
      await queryRunner.dropColumn('statements', 'type')
    }

}
